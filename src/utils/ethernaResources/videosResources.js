import http from "@utils/request"
import apiPath from "./apiPath"


/**
 *
 * @typedef {object} Video
 * @property {string} channelAddress Video channel address
 * @property {string} creationDateTime Video creation date
 * @property {string} encryptionKey Encryption key of the video
 * @property {string} encryptionType Type of encryption (eg: AES256)
 * @property {string} manifestHash Manifest/Feed of the video metadata
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
// POST

/**
 * Create a new video on the index
 * @param {number} hash Hash of the manifest/feed with the video metadata
 * @param {string} encryptionKey Encryption key
 * @param {string} encryptionType Encryption type (default AES256)
 * @returns {Video} Video info
 */
export const createVideo = async (hash, encryptionKey, encryptionType = "AES256") => {
    const path = apiPath()
    const apiUrl = `${path}/videos`

    const resp = await http.post(apiUrl, {
        manifestHash: hash,
        encryptionKey,
        encryptionType
    }, {
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        withCredentials: true
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot create the video")
    }

    return resp.data
}


// ----------------------------------------------------------------------------
// PUT

/**
 * Update a video information
 * @param {string} hash Hash of the video on Swarm
 * @param {string} newHash New manifest hash with video metadata
 * @returns {Video} Video info
 */
export const updateVideo = async (hash, newHash) => {
    const path = apiPath()
    const apiUrl = `${path}/videos/${hash}`

    const resp = await http.put(apiUrl, null, {
        params: {
            newHash
        }
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot update the video")
    }

    return resp.data
}


// ----------------------------------------------------------------------------
// DELETE

/**
 * Delete a video from the index
 * @param {string} hash Hash of the video
 * @returns {boolean} Success state
 */
export const deleteVideo = async hash => {
    const path = apiPath()
    const apiUrl = `${path}/videos/${hash}`

    await http.delete(apiUrl)

    return true
}
