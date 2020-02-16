const axios = require("axios")

export const SwarmGateway = "https://swarm-gateways.net"
export const IpfsGateway = "https://ipfs.infura.io:5001/api/v0"

export const getImageUrl = imageObject => {
    const type = imageObject && imageObject["@type"]

    if (type !== "ImageObject" && type !== "SwarmObject") {
        return null
    }
    const hash = imageObject.contentUrl && imageObject.contentUrl["/"]
    return type !== "ImageObject"
        ? `${SwarmGateway}/bzz-raw://${hash}`
        : `${IpfsGateway}/cat?arg=${hash}`
}

export const uploadImageToSwarm = async (formData, type = "swarm") => {
    const endpoint =
        type.toLowerCase() !== "ipfs"
            ? `${SwarmGateway}/bzz-raw:/`
            : `${IpfsGateway}/add`

    try {
        if (type === "ipfs") {
            let data = new FormData()
            data.append("filename", formData)
            formData = data
        }
        let resp = await axios.post(endpoint, formData)
        let hash = resp.data
        if (isValidHash(hash)) {
            type = type === "ipfs" ? "ImageObject" : "SwarmObject"
            return [{ "@type": type, contentUrl: { "/": hash } }]
        }
    } catch (error) {
        return null
    }
}

export const isValidHash = (hash, type = "swarm") => {
    return type.toLowerCase() !== "ipfs"
        ? /^[0-9a-f]{64}$/.test(hash)
        : /^[0-9a-zA-Z]*$/.test(hash)
}
