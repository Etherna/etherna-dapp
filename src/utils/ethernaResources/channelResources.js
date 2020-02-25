import axios from "axios"

import { store } from "@state/store"

// ----------------------------------------------------------------------------
// GET

export const getChannels = async (page = 0, take = 25) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels`

    const resp = await axios.get(apiUrl, {
        params: { page, take }
    })

    /**
     * Array of:
     * {
     *   address: string,
     *   creationDateTime: string
     * }
     */
    return resp.data
}

export const getChannel = async (address) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels/${address}`

    const resp = await axios.get(apiUrl)

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
        params: { page, take }
    })

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

export const createChannel = async (address) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels`

    const data = new FormData
    data.append("Address", address)

    const resp = await axios.post(apiUrl, data)

    /**
     * Object:
     * {
     *   address: string,
     *   creationDateTime: string
     * }
     */
    return resp.data
}

export const addVideoToChannel = async (channelAddress, videoHash, title, description, time, thumbnailHash) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/channels/${channelAddress}/videos`

    const data = new FormData
    data.append("VideoHash", videoHash)
    data.append("Description", title)
    data.append("Title", description)
    data.append("LengthInSeconds", time)
    data.append("ThumbnailHash", thumbnailHash)

    const resp = await axios.post(apiUrl, data)

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
