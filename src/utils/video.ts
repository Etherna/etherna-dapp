import { pick } from "lodash"

import { getVideoDuration } from "./media"
import { getProfile, Profile } from "./swarmProfile"
import { store } from "@state/store"
import { Bzz, Response } from "@erebos/bzz"
import { IndexEncryptionType, IndexVideo } from "./indexClient/typings"

export type SwarmVideoMeta = {
  /**  Title of the video */
  title: string
  /**  Description of the video */
  description: string
  /**  Quality of the original video */
  originalQuality: string
  /**  Address of the owner of the video */
  ownerAddress: string
  /**  Duration of the video in seconds */
  duration: number
  /**  Hash for the thumbnail */
  thumbnailHash?: string
  /**  List of available qualities of the video */
  sources: (string|SwarmVideoSource)[]
}

export type SwarmVideoSource = {
  path: string
  size?: number
}

export type VideoSourceInfo = {
  /**  Source url */
  source: string
  /**  Source quality */
  quality: string|null
  /**  Source size */
  size: number|null
}

export type VideoResolvedMeta = {
  /**  Title of the video */
  title?: string
  /**  Description of the video */
  description?: string
  /**  Quality of the original video */
  originalQuality?: string
  /**  Duration of the video in seconds */
  duration: number
  /**  Url of the original video */
  source: string
  /**  Hash for the thumbnail */
  thumbnailHash?: string
  /**  Url of the thumbnail */
  thumbnailSource?: string
  /**  Address of the owner of the video */
  ownerAddress?: string
  /**  All qualities of video */
  sources: VideoSourceInfo[]
}

export type VideoMetadata = VideoResolvedMeta & {
  /** Manifest hash of the video */
  videoHash: string
  /** Whether the video is indexed */
  isVideoOnIndex: boolean
  /** When the video was created */
  creationDateTime?: string
  /** Video encryption key */
  encryptionKey?: string
  /** Video encryption type */
  encryptionType?: IndexEncryptionType
  /** Profile data of the owner */
  profileData?: Profile
}

export type IndexVideoFullMeta = IndexVideo & VideoMetadata

/**
 * Get a list of recent videos with meta info
 * @param page Page offset (default = 0)
 * @param take Count of videos to get (default = 25)
 * @param fetchProfile Fetch profile info
 * @param ownerAddress Fetch videos by a profile
 */
export const fetchFullVideosInfo = async (
  page = 0,
  take = 25,
  fetchProfile = true,
  ownerAddress?: string
) => {
  const { indexClient } = store.getState().env
  const videos = ownerAddress
    ? await indexClient.users.fetchUserVideos(ownerAddress, page, take)
    : await indexClient.videos.fetchVideos(page, take)
  const videoManifests: Promise<VideoResolvedMeta|Profile>[] = videos.map(video => fetchVideoMeta(video.manifestHash))
  const promises = videoManifests.concat(
    fetchProfile ? videos.map(video => getProfile(video.ownerIdentityManifest, video.ownerAddress)) : []
  )
  const result = await Promise.all(promises)
  const videosWithMeta = videos.map((video, index) => {
    const meta = result[index] as VideoResolvedMeta
    const profileData = fetchProfile ? result[index + videos.length] as Profile : undefined
    return {
      ...meta,
      videoHash: video.manifestHash,
      ownerAddress: video.ownerAddress,
      creationDateTime: video.creationDateTime,
      encryptionKey: video.encryptionKey,
      encryptionType: video.encryptionType,
      isVideoOnIndex: true,
      profileData,
    } as unknown as IndexVideoFullMeta
  })
  return videosWithMeta
}

/**
 * Get a video metadata and profile
 * @param hash Manifest hash of the video
 * @param fetchProfile Fetch profile info
 */
export const fetchFullVideoInfo = async (hash: string, fetchProfile = true) => {
  const { indexClient } = store.getState().env

  let isVideoOnIndex = false
  let ownerAddress = undefined
  let profileManifest = undefined
  let creationDateTime = undefined
  let encryptionKey = undefined
  let encryptionType = undefined

  try {
    const video = await indexClient.videos.fetchVideo(hash)
    isVideoOnIndex = true
    ownerAddress = video.ownerAddress
    profileManifest = video.ownerIdentityManifest
    creationDateTime = video.creationDateTime
    encryptionKey = video.encryptionKey
    encryptionType = video.encryptionType
  } catch {}

  const result = await Promise.all(
    [fetchVideoMeta(hash)].concat(
      fetchProfile && ownerAddress ? [getProfile(profileManifest, ownerAddress)] as any[] : []
    )
  )

  let [meta, profileData] = result as [meta: VideoResolvedMeta, profileData?: Profile]

  if (!profileData && meta.ownerAddress && fetchProfile) {
    profileData = await getProfile(null, meta.ownerAddress)
  }

  return {
    ...meta,
    videoHash: hash,
    ownerAddress: ownerAddress || profileData?.address,
    isVideoOnIndex,
    creationDateTime,
    encryptionKey,
    encryptionType,
    profileData,
  } as VideoMetadata
}

/**
 * Fetch the video meta information
 * @param videoHash Hash of the video
 * @returns Video metadata
 */
export const fetchVideoMeta = async (videoHash: string): Promise<VideoResolvedMeta> => {
  const { bzzClient } = store.getState().env

  const hashMatches = videoHash.match(/^[0-9a-f]{64}/)
  const hash = hashMatches && hashMatches[0]
  const meta = hash ? await downloadMeta(bzzClient, hash) : null

  const source = meta
    ? hash && videoHash.length > hash.length // probably a /source/... path
      ? bzzClient.getDownloadURL(videoHash)
      : bzzClient.getDownloadURL(`${hash}/sources/${meta.originalQuality}`)
    : bzzClient.getDownloadURL(videoHash, { mode: "raw" }).replace(/\/$/, "")

  const duration = meta?.duration || await videoDuration(source) || 0

  if (!meta) {
    return {
      duration,
      source,
      sources: [{
        source: source,
        quality: null,
        size: null
      }]
    }
  }

  const sources = (meta.sources as SwarmVideoSource[]).map(videoSource => {
    const quality = typeof videoSource === "string" ? videoSource : videoSource.path
    const size = videoSource.size
    const source: string = bzzClient.getDownloadURL(`${hash}/sources/${quality}`)
    return {
      quality,
      size,
      source
    } as VideoSourceInfo
  })
  const thumbnailHash = meta.thumbnailHash
  const thumbnailSource = thumbnailHash && bzzClient.getDownloadURL(thumbnailHash)

  return {
    ...meta,
    source,
    sources,
    thumbnailHash,
    thumbnailSource,
    duration,
  }
}

/**
 * Update video meta information
 * @param manifest Current video manifest hash
 * @param meta Video meta
 * @param pinContent Pin content (default = false)
 * @returns The new video manifest
 */
export const updatedVideoMeta = async (manifest: string, meta: SwarmVideoMeta, pinContent = false) => {
  const { bzzClient } = store.getState().env

  const newManifest: string = await bzzClient.uploadData(meta, {
    manifestHash: manifest,
    contentType: "text/json",
    pin: pinContent
  })

  return newManifest
}

/**
 * Delete a video source quality
 * @param quality Video source quality to delete
 * @param manifest Current video manifest hash
 * @returns The new video manifest
 */
export const deleteVideoSource = async (quality?: string|null, manifest?: string|null) => {
  if (!manifest) return undefined
  if (!quality) return manifest

  const { bzzClient } = store.getState().env

  const newManifest: string = await bzzClient.deleteResource(manifest, `sources/${quality}`)

  return newManifest
}

/**
 * Delete a video thumbnail
 * @param manifest Current video manifest hash
 * @returns The new video manifest
 */
export const deleteThumbnail = async (manifest: string) => {
  const { bzzClient } = store.getState().env

  const newManifest: string = await bzzClient.deleteResource(manifest, `thumbnail`)

  return newManifest
}

//
// Utils
//

/**
 * Get video meta if existing
 * @param bzz Bzz Node
 * @param hash Video hash
 * @returns Video metadata
 */
const downloadMeta = async (bzz: Bzz<any, Response<any>>, hash: string) => {
  try {
    const [list, sourceList] = await Promise.all([
      bzz.list(hash),
      bzz.list(`${hash}/sources`)
    ])

    const prefixed = list.common_prefixes || []
    if (!prefixed.includes("sources/")) {
      throw new Error("The manifest doesn't contain any video source")
    }

    const entries = list.entries || []
    const defaultEntry = entries.find(entry => entry.path === "/")

    if (!defaultEntry || !/^text\//.test(defaultEntry.contentType)) {
      throw new Error("The default entry is not a valid json")
    }

    const thumbnailHash = entries.find(entry => entry.path === "thumbnail") && `${hash}/thumbnail`

    // Load metadata json
    const resp = await bzz.download(hash)
    const meta = await resp.json<SwarmVideoMeta>()

    // Load sources infos (to get video sizes)
    if (sourceList.entries) {
      meta.sources = (meta.sources as string[]).map(source => {
        const entry = sourceList.entries!.find(s => s.path === `sources/${source}`)
        return { path: source, size: entry?.size }
      })
    }

    const defaultMeta = {
      title: "",
      description: "",
      sources: [],
      thumbnailHash
    }

    const videoMetadata: SwarmVideoMeta = pick({ ...defaultMeta, ...meta }, [
      "title",
      "description",
      "ownerAddress",
      "duration",
      "originalQuality",
      "sources",
      "thumbnailHash",
    ])

    return videoMetadata
  } catch (error) {
    return null
  }
}

/**
 * Get video duration
 * @param source Video url
 * @returns Video duration or null
 */
const videoDuration = async (source: string) => {
  try {
    const duration = await getVideoDuration(source)
    return duration
  } catch (error) {
    return null
  }
}
