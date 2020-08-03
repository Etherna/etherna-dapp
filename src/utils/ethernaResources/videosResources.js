import http from "@utils/request"
import apiPath from "./apiPath"


/**
 *
 * @typedef {object} Video
 * @property {string} channelAddress Video channel address
 * @property {string} creationDateTime Video creation date
 * @property {string} description Video description
 * @property {number} lengthInSeconds Video length in seconds
 * @property {string} thumbnailHash Video thumbnail hash on Swarm
 * @property {string} title Video title
 * @property {string} videoHash Video hash on Swarm
 *
 */


// ----------------------------------------------------------------------------
// GET

/**
 * Get a list of recent videos uploaded on the platform
 * @param {number} page Page offset (default = 0)
 * @param {number} take Count of videos to get (default = 25)
 * @returns {Video[]}
 */
export const getVideos = async (page = 0, take = 25) => {
    const path = apiPath()
    const apiUrl = `${path}/videos`

    const resp = await http.get(apiUrl, {
        params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
        throw new Error("Cannot fetch videos")
    }

    return resp.data
}

/**
 * Get video information
 * @param {string} hash Video hash on Swarm
 * @returns {Video}
 */
export const getVideo = async hash => {
    const path = apiPath()
    const apiUrl = `${path}/videos/${hash}`

    const resp = await http.get(apiUrl)

    if (typeof resp.data !== "object") {
        throw new Error("Cannot fetch the video")
    }

    return resp.data
}

// ----------------------------------------------------------------------------
// PUT

/**
 * Update a video information
 * @param {string} hash Hash of the video on Swarm
 * @param {string} title Video title
 * @param {string} description Video description
 * @param {number} time Video duration in seconds
 * @param {string} thumbnailHash Video thumbnail hash on Swarm
 * @returns {Video}
 */
export const updateVideo = async (
    hash,
    title,
    description,
    time,
    thumbnailHash
) => {
    const path = apiPath()
    const apiUrl = `${path}/videos/${hash}`

    const resp = await http.put(apiUrl, {
        VideoHash: hash,
        Title: title,
        Description: description,
        LengthInSeconds: time,
        ThumbnailHash: thumbnailHash,
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot update the video")
    }

    return resp.data
}
