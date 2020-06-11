import axios from "axios"

import { store } from "@state/store"

/**
 * Get the Swarm url of an image or resource
 *
 * @typedef {object} SwarmObject
 * @property {string} hash Resource hash
 * @property {string} url Resource url
 *
 * @param {SwarmObject|string} image Image object definition or hash string value
 * @returns {string|undefined}
 */
export const getResourceUrl = (image) => {
    const SwarmGateway = store.getState().env.gatewayHost

    if (typeof image === "string") {
        return `${SwarmGateway}/bzz-raw:/${image}`
    }

    if (image && typeof image === "object") {
        if (image.hash) {
            return `${SwarmGateway}/bzz-raw:/${image.hash}`
        }
        if (image.url) {
            return image.url
        }
    }

    return undefined
}

/**
 * Upload a file to swarm
 * @param {File} file File to upload
 * @returns {string} Hash of the uplaoded file
 */
export const uploadResourceToSwarm = async file => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-raw:/`

    const buffer = typeof file === "string"
        ? (new TextEncoder()).encode(file)
        : await fileReaderPromise(file)
    const formData = new Blob([new Uint8Array(buffer)])

    const resp = await axios.post(endpoint, formData)
    const hash = resp.data

    if (isValidHash(hash)) {
        return hash
    } else {
        throw new Error("Invalid hash returned")
    }
}

/**
 * Upload a file to swarm with progress and pinning option
 * @param {ArrayBuffer} buffer Buffer of the encoded file
 * @param {Function} progressCallback Progress callback function
 * @param {boolean} pinContent Content should be pinned (default = true)
 * @returns {string} Hash of the uloaded file
 */
export const gatewayUploadWithProgress = async (
    buffer,
    progressCallback,
    pinContent = true
) => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-raw:/`
    const formData = new Blob([new Uint8Array(buffer)])
    const resp = await axios.post(endpoint, formData, {
        headers: {
            "x-swarm-pin": `${pinContent}`,
        },
        onUploadProgress: pev => {
            const progress = Math.round((pev.loaded * 100) / pev.total)
            if (progressCallback) {
                progressCallback(progress)
            }
        },
    })
    const hash = resp.data

    if (isValidHash(hash)) {
        return hash
    } else {
        throw new Error(
            `There was a problem uploading this file. Try again later.`
        )
    }
}

/**
 * Check if pinning is available on the current gateway
 * @returns {boolean}
 */
export const isPinningEnabled = async () => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-pin:/`
    try {
        await axios.get(endpoint)
        return true
    } catch (error) {
        console.error(error)

        if (
            error.response &&
            error.response.data &&
            "Msg" in error.response.data &&
            error.response.data.Msg === "Pinning disabled on this node"
        ) {
            return false
        }
        if (error.response && error.response.status === 403) {
            return false
        }
    }

    throw new Error(
        "Request for pinning has failed. Check if the gateway is secured with a SSL certificate."
    )
}

/**
 * Check if a hash is a valid Swarm hash
 * @param {string} hash Hash of the resource
 * @returns {boolean}
 */
export const isValidHash = (hash) => {
    return /^[0-9a-f]{64}$/.test(hash)
}

/**
 * Get the array buffer of a file
 * @param {File} file File to convert
 * @returns {ArrayBuffer}
 */
export const fileReaderPromise = file => {
    return new Promise((resolve, reject) => {
        let fr = new FileReader()
        fr.onload = () => {
            resolve(fr.result)
        }
        fr.onabort = reject
        fr.onerror = reject
        fr.readAsArrayBuffer(file)
    })
}
