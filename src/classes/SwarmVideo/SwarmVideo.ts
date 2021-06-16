import Axios, { AxiosRequestConfig } from "axios"
import omit from "lodash/omit"

import {
  SwarmVideoDownloadOptions,
  SwarmVideoMeta,
  SwarmVideoRaw,
  SwarmVideoUploadOptions,
  Video,
  VideoSource,
  VideoSourceDriver
} from "./types"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import FairosClient from "@classes/FairosClient"
import SwarmImage from "@classes/SwarmImage"
import SwarmProfile from "@classes/SwarmProfile"
import { IndexVideo } from "@classes/EthernaIndexClient/types"
import { Profile } from "@classes/SwarmProfile/types"
import { getVideoDuration, getVideoResolution } from "@utils/media"

type SwarmVideoOptions = {
  beeClient: SwarmBeeClient
  fairosClient?: FairosClient
  driver?: VideoSourceDriver
  indexClient: EthernaIndexClient
  videoData?: Video
  indexData?: IndexVideo
  profileData?: Profile
  fetchProfile?: boolean
  fetchFromCache?: boolean
  updateCache?: boolean
}

/**
 * Load/Update video info over swarm
 */
export default class SwarmVideo {
  hash?: string
  video: Video
  loadedFromPrefetch: boolean = false

  beeClient: SwarmBeeClient
  fairosClient?: FairosClient
  indexClient: EthernaIndexClient
  fetchProfile: boolean
  fetchFromCache: boolean
  updateCache: boolean
  driver: VideoSourceDriver

  static thumbnailResponsiveSizes = [480, 960, 1440, 2400]

  private indexData?: IndexVideo
  private profileData?: Profile

  constructor(hash: string | undefined, opts: SwarmVideoOptions) {
    this.hash = hash
    this.beeClient = opts.beeClient
    this.fairosClient = opts.fairosClient
    this.indexClient = opts.indexClient
    this.driver = opts.driver ?? "swarm"
    this.indexData = opts.indexData
    this.profileData = opts.profileData
    this.fetchProfile = opts.fetchProfile || true
    this.fetchFromCache = opts.fetchFromCache || true
    this.updateCache = opts.updateCache || true
    this.video = opts.videoData ?? this.defaultVideo()
    this.video.owner = opts.videoData?.owner ?? (
      opts.profileData && {
        ownerAddress: opts.profileData.address,
        ownerIdentityManifest: opts.profileData.manifest,
        profileData: opts.profileData
      }
    )

    if (this.hasPrefetch) {
      this.loadVideoFromPrefetch()
    } else if (this.hasCache && this.fetchFromCache) {
      this.loadVideoFromCache()
    }
  }

  // Props

  get title(): string | undefined {
    return this.video.title
  }
  set title(value: string | undefined) {
    this.video.title = value
  }

  get description(): string | undefined {
    return this.video.description
  }
  set description(value: string | undefined) {
    this.video.description = value
  }

  get originalQuality(): string | undefined {
    return this.video.originalQuality
  }
  set originalQuality(value: string | undefined) {
    this.video.originalQuality = value
  }

  get duration(): number {
    return this.video.duration
  }
  set duration(value: number) {
    this.video.duration = value
  }

  get owner(): Profile | undefined {
    return this.video.owner?.profileData
  }
  set owner(value: Profile | undefined) {
    this.video.ownerAddress = value?.address ?? "0x0"
    this.video.owner = {
      ownerAddress: value?.address ?? "0x0",
      ownerIdentityManifest: value?.manifest,
      profileData: value,
    }
  }

  get thumbnail(): SwarmImage | undefined {
    return this.video.thumbnail
  }

  get sources() {
    return this.video.sources
  }

  get hasPrefetch(): boolean {
    const prefetchVideo = window.prefetchData?.video
    return prefetchVideo?.hash === this.hash
  }

  get hasCache(): boolean {
    return false
  }

  get videoRaw(): SwarmVideoRaw {
    return this.validatedMetadata()
  }
  set videoRaw(value: SwarmVideoRaw) {
    this.video = {
      ...this.video,
      ...this.resolveRawVideo(value)
    }
  }


  // Public methods

  /**
   * Download and parse the video information
   * @param forced If true will download the video even with prefetched data (default = false)
   * @returns The video object
   */
  async downloadVideo(opts: SwarmVideoDownloadOptions = { forced: false, fetchProfile: true }) {
    if (!this.hash) throw new Error("No video hash provided")

    const { forced, fetchProfile } = opts

    if (this.loadedFromPrefetch && !forced) return this.video

    const [indexData, videoMeta] = await Promise.all([
      this.indexData ? Promise.resolve(this.indexData) : this.fetchIndexVideo(),
      this.fetchVideoMetadata()
    ])

    let profile = this.profileData
    const ownerAddress = indexData?.ownerAddress ?? videoMeta.ownerAddress
    if (fetchProfile && ownerAddress) {
      profile = await this.fetchOwnerProfile(ownerAddress, indexData?.ownerIdentityManifest)
    }

    const video: Video = {
      ...videoMeta,
      isVideoOnIndex: !!indexData,
      creationDateTime: indexData?.creationDateTime,
      encryptionKey: indexData?.encryptionKey,
      encryptionType: indexData?.encryptionType,
      totUpvotes: indexData?.totUpvotes,
      totDownvotes: indexData?.totDownvotes,
      owner: {
        ownerAddress,
        ownerIdentityManifest: indexData?.ownerIdentityManifest,
        profileData: profile
      }
    }

    return video
  }

  /**
   * Update video meta on swarm & manifest on index
   */
  async updateVideo() {
    if (!this.video.sources.length) throw new Error("Please add at least 1 video source")

    // update meta
    const meta = this.validatedMetadata()
    const metaData = new TextEncoder().encode(JSON.stringify(meta))
    const videoReference = await this.beeClient.uploadFile(metaData, undefined, { contentType: "text/json" })

    if (this.hash) {
      // update manifest on index
      await this.indexClient.videos.updateVideo(this.hash, videoReference)
    } else {
      // create video on index
      const indexVideo = await this.indexClient.videos.createVideo(videoReference)
      this.video.owner = {
        ownerAddress: indexVideo.ownerAddress,
        ownerIdentityManifest: indexVideo.ownerIdentityManifest,
        profileData: await new SwarmProfile({
          beeClient: this.beeClient,
          address: indexVideo.ownerAddress,
          hash: indexVideo.ownerIdentityManifest,
          fetchFromCache: true,
        }).downloadProfile()
      }
    }

    this.hash = videoReference

    if (this.updateCache) {
      this.updateVideoCache(this.video)
    }

    return this.hash!
  }

  async deleteVideo() {
    if (!this.hash) throw new Error("Please provide a video reference before")

    // TODO! remove pinning if pinned

    await this.indexClient.videos.deleteVideo(this.hash)
  }

  async addVideoSource(video: ArrayBuffer, contentType: string, opts?: SwarmVideoUploadOptions) {
    const quality = SwarmVideo.getSourceName(await getVideoResolution(video))

    if (this.video.sources.find(source => source.quality === quality)) {
      throw new Error("There is another video source with the same quality")
    }

    const duration = await getVideoDuration(video)
    const size = video.byteLength
    const bitrate = Math.round(size * 8 / duration)

    const reference = await this.uploadVideo(video, contentType, opts)

    const source = this.driver === "swarm"
      ? this.beeClient.getFileUrl(reference)
      : `fairos://${reference}`

    const videoSource: VideoSource = {
      source,
      quality,
      reference,
      referenceProtocol: "files",
      contentType,
      size,
      bitrate
    }

    this.video.sources.push(videoSource)

    return reference
  }

  async uploadVideo(videoData: ArrayBuffer, contentType: string, opts?: SwarmVideoUploadOptions) {
    const axiosOptions: AxiosRequestConfig = {
      onUploadProgress: e => {
        if (opts?.onUploadProgress) {
          const { loaded, total } = e

          if (!loaded || !total) return 1

          const progress = Math.round((e.loaded * 100) / e.total)
          opts.onUploadProgress(progress)
        }
      },
      cancelToken: new Axios.CancelToken(function executor(c) {
        if (opts?.onCancelToken) {
          opts.onCancelToken(c)
        }
      }),
    }

    if (this.driver === "swarm") {
      return await this.beeClient.uploadFile(
        new Uint8Array(videoData),
        undefined,
        {
          contentType,
          axiosOptions
        }
      )
    } else {
      const name = Math.random().toString(36).substring(2) + ".mp4"
      const blob = new Blob([videoData], { type: contentType })
      const file = new File([blob], name, { type: contentType })

      await this.fairosClient!.files.upload(file, "etherna", axiosOptions)

      return name
    }
  }

  async addThumbnail(buffer: ArrayBuffer, contentType: string, opts?: SwarmVideoUploadOptions) {
    this.video.thumbnail = new SwarmImage(undefined, {
      beeClient: this.beeClient,
      isResponsive: true,
      responsiveSizes: SwarmVideo.thumbnailResponsiveSizes
    })
    const imageBlob = new Blob([buffer], { type: contentType })
    await this.video.thumbnail.setImageData(imageBlob)

    return await this.video.thumbnail.upload({
      onUploadProgress: opts?.onUploadProgress,
      onCancelToken: opts?.onCancelToken,
    })
  }

  async removeVideoSource(quality: string) {
    const sourceIndex = this.video.sources.findIndex(source => source.quality === quality)
    if (sourceIndex === -1) {
      throw new Error("There is no video source with this quality")
    }

    this.video.sources.splice(sourceIndex, 1)
  }

  async removeThumbnail() {
    if (!this.video.thumbnail) {
      throw new Error("There is no thumbnail to remove")
    }

    this.video.thumbnail = undefined
  }

  static getSourceName(quality: string | number | null) {
    const name = parseInt(`${quality}`).toString().replace(/p?$/, "p")
    return name
  }



  // Private methods

  private defaultVideo() {
    const video: Video = {
      hash: this.hash ?? "",
      duration: 0,
      isVideoOnIndex: false,
      source: this.beeClient.getFileUrl(this.hash ?? ""),
      sources: []
    }
    return video
  }

  private async fetchIndexVideo() {
    try {
      return await this.indexClient.videos.fetchVideo(this.hash!)
    } catch {
      return null
    }
  }

  private async fetchVideoMetadata() {
    try {
      const resp = await this.beeClient.downloadFile(this.hash!)
      const meta = resp.data.json() as SwarmVideoRaw

      return await this.resolveRawVideo(meta)
    } catch { }

    return await this.resolveRawVideo(null)
  }

  private async resolveRawVideo(rawVideo: SwarmVideoRaw | null) {
    let resolvedMeta: SwarmVideoMeta = {
      hash: this.hash!,
      ownerAddress: "0x0",
      duration: 0,
      source: this.beeClient.getFileUrl(this.hash!),
      sources: [{
        quality: "",
        source: this.beeClient.getFileUrl(this.hash!),
        reference: "",
        referenceProtocol: "files"
      }]
    }

    if (rawVideo) {
      resolvedMeta.title = rawVideo.title
      resolvedMeta.description = rawVideo.description
      resolvedMeta.originalQuality = rawVideo.originalQuality
      resolvedMeta.ownerAddress = rawVideo.ownerAddress
      resolvedMeta.duration = rawVideo.duration
      resolvedMeta.thumbnail = rawVideo.thumbnail
        ? new SwarmImage(rawVideo.thumbnail, { beeClient: this.beeClient })
        : undefined
      resolvedMeta.sources = await Promise.all(rawVideo.sources.map(async source => ({
        quality: source.quality,
        reference: source.reference,
        referenceProtocol: source.referenceProtocol,
        source: await this.resolveRawSource(source.reference),
        size: source.size,
        bitrate: source.bitrate,
        contentType: source.contentType
      })))

      const originalSource = resolvedMeta.sources.find(source => source.quality === rawVideo.originalQuality)
      resolvedMeta.source = originalSource?.source ?? resolvedMeta.source
    }

    return resolvedMeta
  }

  private async resolveRawSource(source: string) {
    if (this.driver === "swarm") {
      return this.beeClient.getFileUrl(source)
    } else {
      return await this.resolveFairosSource(source)
    }
  }

  private async resolveFairosSource(path: string) {
    return window.URL.createObjectURL(
      await this.fairosClient!.files.download(path, "")
    )
  }

  private async fetchOwnerProfile(address: string, manifest: string | undefined) {
    try {
      const profile = new SwarmProfile({
        address,
        hash: manifest,
        beeClient: this.beeClient,
        fetchFromCache: true
      })
      return await profile.downloadProfile()
    } catch {
      return undefined
    }
  }

  private validatedMetadata() {
    const meta: SwarmVideoRaw = {
      title: this.video?.title ?? "",
      description: this.video?.description ?? "",
      duration: this.video?.duration ?? 0,
      originalQuality: this.video?.originalQuality ?? "",
      ownerAddress: this.video?.owner?.ownerAddress ?? "0x0",
      thumbnail: this.video?.thumbnail?.imageRaw,
      sources: this.video?.sources?.map(source => omit(source, "source")) ?? []
    }
    return meta
  }

  private loadVideoFromPrefetch() {
    const prefetchVideo = window.prefetchData?.video
    if (prefetchVideo) {
      this.video = prefetchVideo
      this.loadedFromPrefetch = true
    }
  }

  private async loadVideoFromCache() {
    if (!this.hash) return
    //
  }

  private updateVideoCache(video: Video) {
    //
  }

}
