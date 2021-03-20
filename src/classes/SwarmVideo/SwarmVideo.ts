import Axios from "axios"
import omit from "lodash/omit"

import { SwarmVideoDownloadOptions, SwarmVideoMeta, SwarmVideoRaw, SwarmVideoUploadOptions, Video, VideoSource } from "./types"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import { IndexVideo } from "@classes/EthernaIndexClient/types"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import SwarmImage from "@classes/SwarmImage"
import SwarmProfile from "@classes/SwarmProfile"
import { Profile } from "@classes/SwarmProfile/types"
import { getVideoDuration, getVideoResolution } from "@utils/media"

type SwarmVideoOptions = {
  beeClient: SwarmBeeClient
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
  indexClient: EthernaIndexClient
  fetchProfile: boolean
  fetchFromCache: boolean
  updateCache: boolean

  static thumbnailResponsiveSizes = [480, 960, 1440, 2400]

  private indexData?: IndexVideo
  private profileData?: Profile
  private tempHash?: string

  constructor(hash: string|undefined, opts: SwarmVideoOptions) {
    this.hash = hash
    this.beeClient = opts.beeClient
    this.indexClient = opts.indexClient
    this.indexData = opts.indexData
    this.profileData = opts.profileData
    this.fetchProfile = opts.fetchProfile || true
    this.fetchFromCache = opts.fetchFromCache || true
    this.updateCache = opts.updateCache || true
    this.video = opts.videoData ?? this.defaultVideo()

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
    if (!this.tempHash) throw new Error("Please add at least 1 video source")

    // update meta
    const meta = this.validatedMetadata()
    const newManifest = await this.beeClient.uploadToDir([{
      path: "meta",
      data: new TextEncoder().encode(JSON.stringify(meta))
    }], {
      defaultIndexPath: "meta",
      reference: this.tempHash,
    })

    this.tempHash = newManifest

    // update manifest on index
    if (this.hash) {
      await this.indexClient.videos.updateVideo(this.hash, this.tempHash)
    } else {
      const indexVideo = await this.indexClient.videos.createVideo(this.tempHash)
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

    this.hash = this.tempHash
    this.tempHash = undefined

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
    const quality = (await getVideoResolution(video)).toString()

    if (this.video.sources.find(source => source.quality === quality)) {
      throw new Error("There is another video source with the same quality")
    }

    const duration = await getVideoDuration(video)
    const size = video.byteLength
    const bitrate = Math.round(size * 8 / duration)
    const path = SwarmVideo.getSourcePath(quality)

    this.tempHash = await this.beeClient.uploadToDir([{
      path,
      data: new Uint8Array(video)
    }], {
      reference: this.tempHash,
      axiosOptions: {
        onUploadProgress: e => {
          if (opts?.onUploadProgress) {
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
    })

    const videoSource: VideoSource = {
      source: this.beeClient.getBzzUrl(this.tempHash, path),
      quality,
      path,
      contentType,
      size,
      bitrate
    }

    this.video.sources.push(videoSource)

    return this.tempHash
  }

  async addThumbnail(buffer: ArrayBuffer, opts?: SwarmVideoUploadOptions) {
    this.video.thumbnail = new SwarmImage(undefined, {
      beeClient: this.beeClient,
      isResponsive: true,
      responsiveSizes: SwarmVideo.thumbnailResponsiveSizes
    })
    this.video.thumbnail.setImageData(buffer)

    this.tempHash = await this.video.thumbnail.upload({
      reference: this.tempHash,
      path: "thumbnail",
      onUploadProgress: opts?.onUploadProgress,
      onCancelToken: opts?.onCancelToken,
    })

    return this.tempHash
  }

  async removeVideoSource(quality: string) {
    if (!this.tempHash) throw new Error("Please add at least 1 video source")

    if (!this.video.sources.find(source => source.quality === quality)) {
      throw new Error("There is no video source with this quality")
    }

    const path = SwarmVideo.getSourcePath(quality)

    this.tempHash = await this.beeClient.deleteFromDir(this.tempHash!, path)

    return this.tempHash
  }

  async removeThumbnail() {
    if (!this.tempHash) throw new Error("Please add at least 1 video source")

    if (!this.video.thumbnail) {
      throw new Error("There is no video source with this quality")
    }

    const paths = this.video.thumbnail.responsivePaths
    for (const path of paths) {
      this.tempHash = await this.beeClient.deleteFromDir(this.tempHash!, path)
    }

    return this.tempHash
  }

  static getSourcePath(quality: string|number|null) {
    const name = parseInt(`${quality}`).toString().replace(/p?$/, "p")
    return `sources/${name}`
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
      const retrievedData = await this.beeClient.resolveBzz(this.hash!)
      const meta: SwarmVideoRaw = JSON.parse(new TextDecoder().decode(retrievedData))

      return this.resolveRawVideo(meta)
    } catch {}

    return this.resolveRawVideo(null)
  }

  private resolveRawVideo(rawVideo: SwarmVideoRaw|null) {
    let resolvedMeta: SwarmVideoMeta = {
      hash: this.hash!,
      ownerAddress: "0x0",
      duration: 0,
      source: this.beeClient.getFileUrl(this.hash!),
      sources: [{
        quality: "",
        source: this.beeClient.getFileUrl(this.hash!),
        path: ""
      }]
    }

    if (rawVideo) {
      resolvedMeta.title = rawVideo.title
      resolvedMeta.description = rawVideo.description
      resolvedMeta.originalQuality = rawVideo.originalQuality
      resolvedMeta.ownerAddress = rawVideo.ownerAddress
      resolvedMeta.duration = rawVideo.duration
      resolvedMeta.thumbnail = rawVideo.thumbnail ? new SwarmImage(rawVideo.thumbnail, { beeClient: this.beeClient }) : undefined
      resolvedMeta.source = this.beeClient.getBzzUrl(this.hash!, `/sources/${resolvedMeta.originalQuality}`)
      resolvedMeta.sources = rawVideo.sources.map(source => ({
        quality: source.quality,
        path: source.path,
        source: this.beeClient.getBzzUrl(this.hash!, `/sources/${source.quality}`),
        size: source.size,
        bitrate: source.bitrate,
        contentType: source.contentType
      }))
    }

    return resolvedMeta
  }

  private async fetchOwnerProfile(address: string, manifest: string|undefined) {
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
