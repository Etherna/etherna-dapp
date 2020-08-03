import http from "@utils/request"
import apiPath from "./apiPath.js"

/**
 *
 * @typedef {object} Channel
 * @property {string} address Channel address
 * @property {string} creationDateTime Channel creation date
 *
 *
 * @typedef {object} ChannelVideos
 * @property {string} address Channel address
 * @property {string} creationDateTime Channel creation date
 * @property {import('./videosResources.js').Video[]} videos List of recent videos
 *
 */


// ----------------------------------------------------------------------------
// GET

/**
 * Get a list of recent channels
 * @param {number} page Page offset (default = 0)
 * @param {number} take Count of channels to get (default = 25)
 * @returns {Channel[]}
 */
export const getChannels = async (page = 0, take = 25) => {
    const path = apiPath()
    const apiUrl = `${path}/channels`

    const resp = await http.get(apiUrl, {
        params: { page, take }
    })

    if (!Array.isArray(resp.data)) {
        throw new Error("Cannot fetch channels")
    }

    return resp.data
}

/**
 * Get a list of recent channels with the recent videos
 * @param {number} page Page offset (default = 0)
 * @param {number} take Count of channels to get (default = 25)
 * @param {number} videosTake Count of videos to get (default = 5)
 * @returns {ChannelVideos[]}
 */
export const getChannelsWithVideos = async (
    page = 0,
    take = 25,
    videosTake = 5
) => {
    let channels = await getChannels(page, take)
    for (let channel of channels) {
        channel.videos = await getChannelVideos(channel.address, 0, videosTake)
    }
    return channels
}

/**
 * Get a channel from the address
 * @param {string} address Channel address
 * @returns {Channel}
 */
export const getChannel = async address => {
    const path = apiPath()
    const apiUrl = `${path}/channels/${address}`

    const resp = await http.get(apiUrl)

    if (typeof resp.data !== "object") {
        throw new Error("Cannot fetch channel")
    }

    return resp.data
}

/**
 * Get a list of recent videos by a channel
 * @param {string} address Channel address
 * @param {number} page Page offset (default = 0)
 * @param {number} take Count of videos to get (default = 25)
 * @returns {import('./videosResources.js').Video[]}
 */
export const getChannelVideos = async (address, page = 0, take = 25) => {
    const path = apiPath()
    const apiUrl = `${path}/channels/${address}/videos`

    const resp = await http.get(apiUrl, {
        params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
        throw new Error("Cannot fetch channel videos")
    }

    return resp.data
}

// ----------------------------------------------------------------------------
// POST

/**
 * Create a new channel
 * @param {string} address New channel address
 * @returns {Channel}
 */
export const createChannel = async address => {
    const path = apiPath()
    const apiUrl = `${path}/channels`

    const resp = await http.post(apiUrl, {
        Address: address,
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot create channel")
    }

    return resp.data
}

/**
 * Add a video to a channel
 * @param {string} channelAddress Channel address
 * @param {string} videoHash Hash of the video on Swarm
 * @param {string} title Video title
 * @param {string} description Video description
 * @param {number} time Video duration in seconds
 * @param {string} thumbnailHash Video thumbnail hash on Swarm
 * @returns {import('./videosResources.js').Video}
 */
export const addVideoToChannel = async (
    channelAddress,
    videoHash,
    title,
    description,
    time,
    thumbnailHash
) => {
    const path = apiPath()
    const apiUrl = `${path}/channels/${channelAddress}/videos`

    const resp = await http.post(apiUrl, {
        VideoHash: videoHash,
        Description: description,
        Title: title,
        LengthInSeconds: time,
        ThumbnailHash: thumbnailHash,
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot add video to the channel")
    }

    return resp.data
}

// ----------------------------------------------------------------------------
// DELETE

/**
 * Remove a video from a channel
 * @param {string} channelAddress Channel address
 * @param {string} videoHash Hash of the video to remove
 * @returns {boolean}
 */
export const removeVideoFromChannel = async (channelAddress, videoHash) => {
    const path = apiPath()
    const apiUrl = `${path}/channels/${channelAddress}/videos/${videoHash}`

    await http.delete(apiUrl)

    return true
}
