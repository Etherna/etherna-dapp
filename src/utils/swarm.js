import { isArray } from "lodash"

import { store } from "@state/store"
import http from "@utils/request"

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

    const resp = await http.post(endpoint, formData)
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
 * @param {Function} cancelTokenCallback Axios cancellation token callback
 * @param {boolean} pinContent Content should be pinned (default = true)
 * @returns {string} Hash of the uloaded file
 */
export const gatewayUploadWithProgress = async (
    buffer,
    progressCallback,
    cancelTokenCallback,
    pinContent = true,
) => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-raw:/`
    const formData = new Blob([new Uint8Array(buffer)])
    const resp = await http.post(endpoint, formData, {
        headers: {
            "x-swarm-pin": `${pinContent}`,
        },
        onUploadProgress: pev => {
            const progress = Math.round((pev.loaded * 100) / pev.total)
            if (progressCallback) {
                progressCallback(progress)
            }
        },
        cancelToken: new http.CancelToken(function executor(c) {
            cancelTokenCallback && cancelTokenCallback(c)
        })
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
        await http.get(endpoint)
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
 * Check if a resource is pinned on the current gateway.
 * @param {string|string[]} hashList Swarm file hash or array of hashes
 * @returns {boolean}
 */
export const isPinned = async hashList => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-pin:/`
    const hashes = isArray(hashList)
        ? hashList
        : [hashList]

    try {
        const resp = await http.get(endpoint)
        const pins = isArray(resp.data)
            ? resp.data.filter(pin => hashes.indexOf(pin.Address) >= 0)
            : []

        let allPinned = true
        hashes.forEach(hash => {
            if (pins.findIndex(pin => pin.Address === hash) === -1) {
                allPinned = false
            }
        })

        return allPinned
    } catch {
        return false
    }
}

/**
 * Pin a content after the upload on the current gateway.
 * @param {string} hash Swarm file hash
 * @param {boolean} raw The hash is raw content (default = false)
 * @returns {boolean}
 */
export const pinResource = async (hash, raw = false) => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-pin:/${hash}`

    try {
        await http.post(endpoint, null, {
            params: {
                raw: raw ? "true" : null
            }
        })
        return true
    } catch {
        return false
    }
}

/**
 * Unpin a content after the upload on the current gateway.
 * @param {string} hash Swarm file hash
 * @returns {boolean}
 */
export const unpinResource = async hash => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-pin:/${hash}`

    try {
        await http.delete(endpoint)
        return true
    } catch {
        return false
    }
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
