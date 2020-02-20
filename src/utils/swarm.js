import axios from "axios"

export const SwarmGateway = "https://swarm-gateways.net"
export const IpfsGateway = "https://ipfs.infura.io"

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
    if (typeof imageObject === "string") {
        return type.toLowerCase() !== "ipfs"
            ? `${SwarmGateway}/bzz-raw://${imageObject}`
            : `${IpfsGateway}/ipfs/${imageObject}`
    }

    type = imageObject && imageObject[0] && imageObject[0]["@type"]

    if (type !== "ImageObject" && type !== "SwarmObject") {
        return null
    }

    const hash = imageObject[0].contentUrl && imageObject[0].contentUrl["/"]
    return type !== "ImageObject"
        ? `${SwarmGateway}/bzz-raw://${hash}`
        : `${IpfsGateway}/ipfs/${hash}`
}

export const uploadResourceToSwarm = async (
    formData,
    type = "swarm"
) => {
    const endpoint =
        type.toLowerCase() !== "ipfs"
            ? `${SwarmGateway}/bzz-raw:/`
            : `${IpfsGateway}:5001/api/v0/add`

    try {
        if (type === "ipfs") {
            let data = new FormData()
            data.append("filename", formData)
            formData = data
        }

        let resp = await axios.post(endpoint, formData)
        let hash = type === "ipfs" ? resp.data.Hash : resp.data

        // if (isValidHash(hash)) {
        type = type === "ipfs" ? "ImageObject" : "SwarmObject"
        return [{ "@type": type, contentUrl: { "/": hash } }]
        // } else {
        //     return null
        // }
    } catch (error) {
        console.error(error)
        return null
    }
}

export const uploadVideoToSwarm = async (
    file,
    progressCallback
) => {
    const endpoint = `${SwarmGateway}/bzz:/?defaultpath=${file.name}`

    try {
        // const videoBuffer = await fileReaderPromise(file)
        // const videoData = new Blob([new Uint8Array(videoBuffer)])

        const data = new FormData()
        data.append('uploadSelected', file.name)
        data.append('file', file)

        const resp = await axios.post(endpoint, data, {
            headers: {
                accept: 'text'
            },
            onUploadProgress: pev => {
                const progress = Math.round((pev.loaded * 100) / pev.total)
                if (progressCallback) {
                    console.log(`Uploaded ${progress}%`)

                    progressCallback(progress)
                }
            },
        })
        const hash = resp.data

        return isValidHash(hash) ?
            hash :
            undefined
    } catch (error) {
        console.error(error)
        return undefined
    }
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
