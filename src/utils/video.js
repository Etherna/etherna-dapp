import { Bzz } from "@erebos/bzz"
import { pick } from "lodash"

import { getVideoDuration } from "./media"
import { getProfile } from "./swarmProfile"
import { store } from "@state/store"

/**
 * @typedef SwarmVideoMeta
 * @property {string} title Title of the video
 * @property {string} description Description of the video
 * @property {string} originalQuality Quality of the original video
 * @property {string} thumbnailHash Hash for the thumbnail
 * @property {string} channelAddress Address of the channel owner of the video
 * @property {number} duration Duration of the video in seconds
 * @property {string[]} sources List of available qualities of the video
 *
 * @typedef VideoResolvedMeta
 * @property {string} title Title of the video
 * @property {string} description Description of the video
 * @property {string} originalQuality Quality of the original video
 * @property {string} thumbnailHash Hash for the thumbnail
 * @property {number} duration Duration of the video in seconds
 * @property {string} source Url of the original video
 * @property {string} thumbnailSource Url of the thumbnail
 * @property {string} channelAddress Address of the channel owner of the video
 * @property {{ source: string, quality: string }[]} sources All qualities of video
 *
 * @typedef {object} VideoMetadata
 * @property {string} videoHash Manifest hash of the video
 * @property {string} title Title of the video
 * @property {string} description Description of the video
 * @property {string} originalQuality Quality of the original video
 * @property {string} thumbnailHash Hash for the thumbnail
 * @property {number} duration Duration of the video in seconds
 * @property {string} source Url of the original video
 * @property {string} thumbnailSource Url of the thumbnail
 * @property {string} channelAddress Address of the channel owner of the video
 * @property {{ source: string, quality: string }[]} sources All qualities of video
 * @property {string} channelAddress
 * @property {string} creationDateTime
 * @property {boolean} isVideoOnIndex
 * @property {string} encryptionKey
 * @property {string} encryptionType
 * @property {import("./swarmProfile").Profile} profileData
 */

/**
 * Get a list of recent videos with meta info
 * @param {number} page Page offset (default = 0)
 * @param {number} take Count of videos to get (default = 25)
 * @param {boolean} fetchProfile Fetch channel profile info
 * @param {string} channelAddress Fetch videos by a channel
 * @returns {VideoMetadata[]}
 */
export const fetchFullVideosInfo = async (
  page = 0,
  take = 25,
  fetchProfile = true,
  channelAddress
) => {
  const { indexClient } = store.getState().env
  const videos = channelAddress
    ? await indexClient.users.fetchUserVideos(channelAddress, page, take)
    : await indexClient.videos.fetchVideos(page, take)
  const videoManifests = videos.map(video => fetchVideoMeta(video.manifestHash))
  const promises = videoManifests.concat(
    fetchProfile ? videos.map(video => getProfile(video.channelAddress)) : []
  )
  const result = await Promise.all(promises)
  const videosWithMeta = videos.map((video, index) => {
    const meta = result[index]
    const profileData = fetchProfile && result[index + videos.length]
    return {
      ...meta,
      videoHash: video.manifestHash,
      channelAddress: video.channelAddress,
      creationDateTime: video.creationDateTime,
      encryptionKey: video.encryptionKey,
      encryptionType: video.encryptionType,
      isVideoOnIndex: true,
      profileData,
    }
  })
  return videosWithMeta
}

/**
 * Get a video metadata and channel profile
 * @param {string} hash Manifest hash of the video
 * @param {boolean} fetchProfile Fetch channel profile info
 * @returns {VideoMetadata}
 */
export const fetchFullVideoInfo = async (hash, fetchProfile = true) => {
  const { indexClient } = store.getState().env

  let isVideoOnIndex = false
  let channelAddress = null
  let creationDateTime = null
  let encryptionKey = null
  let encryptionType = null

  try {
    const video = await indexClient.videos.fetchVideo(hash)
    isVideoOnIndex = true
    channelAddress = video.channelAddress
    creationDateTime = video.creationDateTime
    encryptionKey = video.encryptionKey
    encryptionType = video.encryptionType
  } catch {}

  const result = await Promise.all(
    [fetchVideoMeta(hash)].concat(
      fetchProfile && channelAddress ? [getProfile(channelAddress)] : []
    )
  )

  let [meta, profileData] = result

  if (!profileData && meta.channelAddress && fetchProfile) {
    profileData = await getProfile(meta.channelAddress)
  }

  return {
    ...meta,
    videoHash: hash,
    channelAddress: channelAddress || profileData.address,
    isVideoOnIndex,
    creationDateTime,
    encryptionKey,
    encryptionType,
    profileData,
  }
}

/**
 * Fetch the video meta information
 *
 * @param {string} videoHash Hash of the video
 * @returns {VideoResolvedMeta} Video metadata
 */
export const fetchVideoMeta = async videoHash => {
  const { gatewayHost } = store.getState().env
  const bzz = new Bzz({ url: gatewayHost })

  const hash = videoHash.match(/^[0-9a-f]{64}/)[0]
  const meta = await downloadMeta(bzz, hash)

  const source = meta
    ? videoHash.length > hash // probably a /source/... path
      ? bzz.getDownloadURL(videoHash)
      : bzz.getDownloadURL(`${hash}/sources/${meta.originalQuality}`)
    : bzz.getDownloadURL(videoHash, { mode: "raw" }).replace(/\/$/, "")

  const duration = await videoDuration(source)

  if (!meta) {
    return { source, duration }
  }

  const sources = meta.sources.map(quality => ({
    quality,
    source: bzz.getDownloadURL(`${hash}/sources/${quality}`),
  }))
  const thumbnailSource = meta.thumbnailHash
    ? bzz.getDownloadURL(meta.thumbnailHash)
    : null

  return {
    ...meta,
    source,
    sources,
    thumbnailSource,
    duration,
  }
}

/**
 * Update video meta information
 *
 * @param {string} manifest Current video manifest hash
 * @param {SwarmVideoMeta} meta Video meta
 * @returns {string} The new video manifest
 */
export const updatedVideoMeta = async (manifest, meta) => {
  const { gatewayHost } = store.getState().env
  const bzz = new Bzz({ url: gatewayHost })

  const newManifest = await bzz.uploadData(meta, {
    manifestHash: manifest,
    contentType: "text/json",
  })

  return newManifest
}

/**
 * Delete a video source quality
 *
 * @param {string} quality Video source quality to delete
 * @param {string} manifest Current video manifest hash
 * @returns {string} The new video manifest
 */
export const deleteVideoSource = async (quality, manifest) => {
  const { gatewayHost } = store.getState().env
  const bzz = new Bzz({ url: gatewayHost })

  const newManifest = await bzz.deleteResource(manifest, `sources/${quality}`)

  return newManifest
}

//
// Utils
//

/**
 * Get video meta if existing
 *
 * @param {Bzz} bzz Bzz Node
 * @param {string} hash Video hash
 * @returns {SwarmVideoMeta} Video metadata
 */
const downloadMeta = async (bzz, hash) => {
  try {
    const list = await bzz.list(hash)

    const prefixed = list.common_prefixes || []
    if (!prefixed.includes("sources/")) {
      throw new Error("The manifest doesn't contain any video source")
    }

    const entries = list.entries || []
    const defaultEntry = entries.find(entry => entry.path === "/")

    if (!defaultEntry || !/^text\//.test(defaultEntry.contentType)) {
      throw new Error("The default entry is not a valid json")
    }

    const resp = await bzz.download(hash)
    const meta = await resp.json()

    const defaultMeta = {
      title: "",
      description: "",
      sources: [],
    }
    return pick({ ...defaultMeta, ...meta }, [
      "title",
      "description",
      "channelAddress",
      "thumbnailHash",
      "duration",
      "originalQuality",
      "sources",
    ])
  } catch (error) {
    return null
  }
}

/**
 * Get video duration
 * @param {string} source Video url
 * @returns {number} Video duration or
 */
const videoDuration = async source => {
  try {
    const duration = await getVideoDuration(source)
    return duration
  } catch (error) {
    return null
  }
}
