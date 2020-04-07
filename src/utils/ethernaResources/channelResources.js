import axios from "axios"

import { store } from "@state/store"

// ----------------------------------------------------------------------------
// GET

export const getChannels = async (page = 0, take = 25) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels`

    const resp = await axios.get(apiUrl, {
        params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
        throw new Error("Cannot fetch channels")
    }

    /**
     * Array of:
     * {
     *   address: string,
     *   creationDateTime: string
     * }
     */
    return resp.data
}

export const getChannelsWithVideos = async (
    page = 0,
    take = 25,
    videosTake = 5
) => {
    let channels = await getChannels(page, take)
    for (let channel of channels) {
        channel.videos = await getChannelVideos(channel.address, 0, videosTake)
    }

    /**
     * Array of:
     * {
     *   address: string,
     *   creationDateTime: string,
     *   videos: [
     *     channelAddress: string,
     *     creationDateTime: string,
     *     description: string,
     *     lengthInSeconds: number,
     *     thumbnailHash: string,
     *     title: string,
     *     videoHash: string,
     *   ]
     * }
     */
    return channels
}

export const getChannel = async address => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels/${address}`

    const resp = await axios.get(apiUrl)

    if (typeof resp.data !== "object") {
        throw new Error("Cannot fetch channel")
    }

    /**
     * Object:
     * {
     *   address: string,
     *   creationDateTime: string
     * }
     */
    return resp.data
}

export const getChannelVideos = async (address, page = 0, take = 25) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels/${address}/videos`

    const resp = await axios.get(apiUrl, {
        params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
        throw new Error("Cannot fetch channel videos")
    }

    /**
     * Array of:
     * {
     *   channelAddress: string,
     *   creationDateTime: string,
     *   description: string,
     *   lengthInSeconds: number,
     *   thumbnailHash: string,
     *   title: string,
     *   videoHash: string,
     * }
     */
    return resp.data
}

// ----------------------------------------------------------------------------
// POST

export const createChannel = async address => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels`

    const resp = await axios.post(apiUrl, {
        Address: address,
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot create channel")
    }

    /**
     * Object:
     * {
     *   address: string,
     *   creationDateTime: string
     * }
     */
    return resp.data
}

export const addVideoToChannel = async (
    channelAddress,
    videoHash,
    title,
    description,
    time,
    thumbnailHash
) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels/${channelAddress}/videos`

    const resp = await axios.post(apiUrl, {
        VideoHash: videoHash,
        Description: description,
        Title: title,
        LengthInSeconds: time,
        ThumbnailHash: thumbnailHash,
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot add video to the channel")
    }

    /**
     * Object:
     * {
     *   channelAddress: string,
     *   creationDateTime: string,
     *   description: string,
     *   lengthInSeconds: number,
     *   thumbnailHash: string,
     *   title: string,
     *   videoHash: string,
     * }
     */
    return resp.data
}

// ----------------------------------------------------------------------------
// DELETE

export const removeVideoFromChannel = async (channelAddress, videoHash) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels/${channelAddress}/videos/${videoHash}`

    await axios.delete(apiUrl)

    return true
}
