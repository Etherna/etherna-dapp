import { pick } from "lodash"

import { getVideoDuration } from "./media"
import { getProfile } from "./swarmProfile"
import { store } from "@state/store"

/**
 * @typedef SwarmVideoMeta
 * @property {string} title Title of the video
 * @property {string} description Description of the video
 * @property {string} originalQuality Quality of the original video
 * @property {string} ownerAddress Address of the owner of the video
 * @property {number} duration Duration of the video in seconds
 * @property {string} thumbnailHash Hash for the thumbnail
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
 * @property {string} ownerAddress Address of the owner of the video
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
 * @property {string} ownerAddress Address of the owner of the video
 * @property {{ source: string, quality: string }[]} sources All qualities of video
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
 * @param {boolean} fetchProfile Fetch profile info
 * @param {string} ownerAddress Fetch videos by a profile
 * @returns {VideoMetadata[]}
 */
export const fetchFullVideosInfo = async (
  page = 0,
  take = 25,
  fetchProfile = true,
  ownerAddress
) => {
  const { indexClient } = store.getState().env
  const videos = ownerAddress
    ? await indexClient.users.fetchUserVideos(ownerAddress, page, take)
    : await indexClient.videos.fetchVideos(page, take)
  const videoManifests = videos.map(video => fetchVideoMeta(video.manifestHash))
  const promises = videoManifests.concat(
    fetchProfile ? videos.map(video => getProfile(video.ownerIdentityManifest, video.ownerAddress)) : []
  )
  const result = await Promise.all(promises)
  const videosWithMeta = videos.map((video, index) => {
    const meta = result[index]
    const profileData = fetchProfile && result[index + videos.length]
    return {
      ...meta,
      videoHash: video.manifestHash,
      ownerAddress: video.ownerAddress,
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
 * Get a video metadata and profile
 * @param {string} hash Manifest hash of the video
 * @param {boolean} fetchProfile Fetch profile info
 * @returns {VideoMetadata}
 */
export const fetchFullVideoInfo = async (hash, fetchProfile = true) => {
  const { indexClient } = store.getState().env

  let isVideoOnIndex = false
  let ownerAddress = null
  let profileManifest = null
  let creationDateTime = null
  let encryptionKey = null
  let encryptionType = null

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
      fetchProfile && ownerAddress ? [getProfile(profileManifest, ownerAddress)] : []
    )
  )

  let [meta, profileData] = result

  if (!profileData && meta.ownerAddress && fetchProfile) {
    profileData = await getProfile(null, meta.ownerAddress)
  }

  return {
    ...meta,
    videoHash: hash,
    ownerAddress: ownerAddress || profileData.address,
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
  const { bzzClient } = store.getState().env

  const hash = videoHash.match(/^[0-9a-f]{64}/)[0]
  const meta = await downloadMeta(bzzClient, hash)

  const source = meta
    ? videoHash.length > hash // probably a /source/... path
      ? bzzClient.getDownloadURL(videoHash)
      : bzzClient.getDownloadURL(`${hash}/sources/${meta.originalQuality}`)
    : bzzClient.getDownloadURL(videoHash, { mode: "raw" }).replace(/\/$/, "")

  const duration = (meta || {}).duration || await videoDuration(source)

  if (!meta) {
    return { source, duration }
  }

  const sources = meta.sources.map(quality => ({
    quality,
    source: bzzClient.getDownloadURL(`${hash}/sources/${quality}`),
  }))
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
 *
 * @param {string} manifest Current video manifest hash
 * @param {SwarmVideoMeta} meta Video meta
 * @param {boolean} pinContent Pin content (default = false)
 * @returns {string} The new video manifest
 */
export const updatedVideoMeta = async (manifest, meta, pinContent = false) => {
  const { bzzClient } = store.getState().env

  const newManifest = await bzzClient.uploadData(meta, {
    manifestHash: manifest,
    contentType: "text/json",
    pin: pinContent
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
  const { bzzClient } = store.getState().env

  const newManifest = await bzzClient.deleteResource(manifest, `sources/${quality}`)

  return newManifest
}

/**
 * Delete a video thumbnail
 *
 * @param {string} manifest Current video manifest hash
 * @returns {string} The new video manifest
 */
export const deleteThumbnail = async manifest => {
  const { bzzClient } = store.getState().env

  const newManifest = await bzzClient.deleteResource(manifest, `thumbnail`)

  return newManifest
}

//
// Utils
//

/**
 * Get video meta if existing
 *
 * @param {import("@erebos/bzz").Bzz} bzz Bzz Node
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

    const thumbnailHash = entries.find(entry => entry.path === "thumbnail") && `${hash}/thumbnail`

    const resp = await bzz.download(hash)
    const meta = await resp.json()

    const defaultMeta = {
      title: "",
      description: "",
      sources: [],
      thumbnailHash
    }
    return pick({ ...defaultMeta, ...meta }, [
      "title",
      "description",
      "ownerAddress",
      "duration",
      "originalQuality",
      "sources",
      "thumbnailHash",
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
