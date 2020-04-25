import axios from "axios"

import { store } from "@state/store"

export const getResourceUrl = (image) => {
    const SwarmGateway = store.getState().env.gatewayHost

    if (typeof image === "string") {
        return `${SwarmGateway}/bzz-raw:/${image}`
    }

    if (typeof image === "object") {
        if (image.hash) {
            return `${SwarmGateway}/bzz-raw:/${image.hash}`
        }
        if (image.url) {
            return image.url
        }
    }

    return undefined
}

export const uploadResourceToSwarm = async (file) => {
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

export const gatewayUploadWithProgress = async (
    file,
    progressCallback,
    pinContent = true
) => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-raw:/`
    const buffer = await fileReaderPromise(file)
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
    }
    else {
        throw new Error(`There was a problem uploading ${file.name}. Try again later.`)
    }
}

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

export const isValidHash = (hash) => {
    return /^[0-9a-f]{64}$/.test(hash)
}

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
