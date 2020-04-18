import axios from "axios"

import { store } from "@state/store"

// ----------------------------------------------------------------------------
// GET

export const getVideos = async (page = 0, take = 25) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/videos`

    const resp = await axios.get(apiUrl, {
        params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
        throw new Error("Cannot fetch videos")
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

export const getVideo = async hash => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/videos/${hash}`

    const resp = await axios.get(apiUrl)

    if (typeof resp.data !== "object") {
        throw new Error("Cannot fetch the video")
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
// PUT

export const updateVideo = async (
    hash,
    title,
    description,
    time,
    thumbnailHash
) => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/videos/${hash}`

    const resp = await axios.put(apiUrl, {
        VideoHash: hash,
        Title: title,
        Description: description,
        LengthInSeconds: time,
        ThumbnailHash: thumbnailHash,
    })

    if (typeof resp.data !== "object") {
        throw new Error("Cannot update the video")
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
