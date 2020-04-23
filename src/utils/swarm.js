import axios from "axios"

import { store } from "@state/store"

const IpfsGateway = "https://ipfs.infura.io"

export const isImageObject = imgObject => {
    if (imgObject && typeof imgObject === "object") {
        let hash =
            imgObject &&
            imgObject[0] &&
            imgObject[0].contentUrl &&
            imgObject[0].contentUrl["/"]
        return hash && typeof hash == "string"
    }
    return false
}

export const getResourceUrl = (imageObject, type = "swarm") => {
    const SwarmGateway = store.getState().env.gatewayHost

    if (typeof imageObject === "string") {
        return type.toLowerCase() !== "ipfs"
            ? `${SwarmGateway}/bzz:/${imageObject}`
            : `${IpfsGateway}/ipfs/${imageObject}`
    }

    type = imageObject && imageObject[0] && imageObject[0]["@type"]

    if (type !== "ImageObject" && type !== "SwarmObject") {
        return null
    }

    const hash = imageObject[0].contentUrl && imageObject[0].contentUrl["/"]
    return type !== "ImageObject"
        ? `${SwarmGateway}/bzz:/${hash}`
        : `${IpfsGateway}/ipfs/${hash}`
}

export const uploadResourceToSwarm = async (file) => {
    const SwarmGateway = store.getState().env.gatewayHost
    const endpoint = `${SwarmGateway}/bzz-raw:/`

    const buffer = await fileReaderPromise(file)
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

export const isValidHash = (hash, type = "swarm") => {
    return type.toLowerCase() !== "ipfs"
        ? /^[0-9a-f]{64}$/.test(hash)
        : /^[0-9a-zA-Z]*$/.test(hash)
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
