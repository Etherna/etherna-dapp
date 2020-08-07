import { Bzz } from "@erebos/bzz"
import { BzzFeed } from "@erebos/bzz-feed"
import { pick } from "lodash"

import { getVideoDuration } from "./media"
import { store } from "@state/store"

/**
 * @typedef {object} SwarmVideoMeta
 * @property {string} title Title of the video
 * @property {string} description Description of the video
 * @property {string} originalQuality Quality of the original video
 * @property {string} thumbnailHash Hash for the thumbnail
 * @property {number} duration Duration of the video in seconds
 *
 * @typedef {object} VideoMetadata
 * @property {string} source Url of the original video
 * @property {string} thumbnailSource Url of the thumbnail
 * @property {number} duration Duration of the video in seconds
 * @property {{ source: string, quality: string }[]} sources All qualities of video
 */

/**
 * Fetch the video meta information
 *
 * @param {string} videoHash Hash of the video
 * @returns {SwarmVideoMeta & VideoMetadata} Video metadata
 */
export const fetchVideoMeta = async videoHash => {
    const { gatewayHost } = store.getState().env
    const bzz = new Bzz({ url: gatewayHost })

    const meta = await downloadMeta(videoHash)
    const source = meta
        ? bzz.getDownloadURL(`${videoHash}/sources/${meta.originalQuality}`)
        : bzz.getDownloadURL(videoHash, { mode: "raw" })

    const duration = await videoDuration(source)

    if (!meta) {
        return { source, duration }
    }

    const videoEntries = await bzz.list(`${videoHash}/sources`)
    const sources = videoEntries.entries.map(entry => ({
        quality: entry.path.replace(/^sources\//, ""),
        source: bzz.getDownloadURL(`${videoHash}/${entry.path}`)
    }))
    const thumbnailSource = meta.thumbnailHash
        ? bzz.getDownloadURL(meta.thumbnailHash)
        : null

    return {
        ...meta,
        source,
        thumbnailSource,
        duration,
        sources
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

    const newManifest = await bzz.uploadData(
        meta,
        { manifestHash: manifest, contentType: "text/json" }
    )

    return newManifest
}

/**
 * Update video feed with a manifest containing the emtadata
 *
 * @param {string} feed Feed manifest (null to create a new one)
 * @param {string} videoManifest Video manifest with metadata
 * @returns {string} The fedd manifest hash
 */
export const updateVideoFeed = async (feed, videoManifest) => {
    const { gatewayHost, wallet } = store.getState().env
    const { address: user } = store.getState().user
    const signBytes = async bytes => wallet.sign(bytes, true)

    const bzz = new Bzz({ url: gatewayHost })
    const bzzFeed = new BzzFeed({ bzz, signBytes })

    const resp = await bzzFeed.setContentHash(
        feed ? feed : { user, name: `${+(new Date())}` },
        videoManifest
    )
    const feedManifest = await resp.json()

    return feedManifest
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
        const resp = await bzz.download(hash)
        const meta = await resp.json()
        return pick(meta, [
            "title",
            "description",
            "originalQuality"
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