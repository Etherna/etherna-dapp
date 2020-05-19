import axios from "axios"
import web3 from "web3"

import { checkIsEthAddress } from "./ethFuncs"
import { readFeed, updatedFeed } from "./feedFuncs"
import { getResourceUrl, isValidHash } from "./swarm"
import promisePipeline from "./promisePipeline"

const EthernaTopicName = "Etherna"
const EthernaTopic = web3.utils.padRight(web3.utils.fromAscii(EthernaTopicName), 64)
const EthernaVideoName = "EthernaVideo"

export const getProfile = async address => {
    const [
        baseProfile,
        ethernaVideoProfile
    ] = await promisePipeline([
        resolveProfile(EthernaTopic, null, address),
        resolveProfile(EthernaTopic, EthernaVideoName, address)
    ])

    return {
        ...baseProfile,
        ...ethernaVideoProfile
    }
}

export const getProfiles = async addresses => {
    try {
        let profiles = []

        for (let address of addresses) {
            const profile = await getProfile(address)
            profiles.push(profile)
        }

        return profiles
    } catch (error) {
        console.error(error)

        return addresses.map(a => ({
            address: a,
            name: null
        }))
    }
}

export const updateProfile = async (profile) => {
    const address = profile.address

    // Split profile data into "base profile" and "etherna video profile"
    let baseProfile = {
        address: profile.address,
        name: profile.name,
        avatar: profile.avatar,
        description: profile.description,
    }
    let ethernaVideoProfile = web3.utils._.omit(profile, "name", "avatar", "cover")

    // Get validated profiles
    baseProfile = await validatedProfile(baseProfile)
    ethernaVideoProfile = await validatedProfile(ethernaVideoProfile)

    // Update feed
    await updatedFeed(EthernaTopic, undefined, address, JSON.stringify(baseProfile))
    await updatedFeed(EthernaTopic, EthernaVideoName, address, JSON.stringify(ethernaVideoProfile))
}


// Private utils functions
const resolveProfile = async (topic, name, address) => {
    const profile = await fetchFeedOrDefault(topic, name, address)
    return {
        address,
        name: null,
        location: null,
        website: null,
        birthday: null,

        ...profile,

        avatar: resolveImage(profile.avatar),
        cover: resolveImage(profile.cover),
        description: (await resolveText(profile.description)),
    }
}

const resolveImage = imgObj => {
    let url = null, hash = null
    if (
        typeof imgObj === "object" &&
        "@type" in imgObj &&
        "value" in imgObj &&
        imgObj["@type"] === "image" &&
        isValidHash(imgObj.value)
    ) {
        url = getResourceUrl(imgObj.value)
        hash = imgObj.value
    }
    return {
        url, hash
    }
}

const resolveText = async textObj => {
    let text = ""

    if (typeof textObj === "string") {
        return textObj
    }

    if (
        typeof textObj === "object" &&
        "@type" in textObj &&
        "value" in textObj &&
        textObj["@type"] === "text" &&
        isValidHash(textObj.value)
    ) {
        const url = getResourceUrl(textObj.value)
        try {
            text = (await axios.get(url)).data
        } catch {}
    }

    return text
}

const validatedProfile = async profile => {
    // Object validation
    if (typeof profile !== "object") {
        throw new Error ("Profile must be an object")
    }
    if (!checkIsEthAddress(profile.address)) {
        throw new Error ("Address field is required and must be a valid ethereum address")
    }
    if (profile.name) {
        if (typeof profile.name !== "string" || profile.name.length > 50) {
            throw new Error ("Name field must be a string not longer than 50")
        }
    }
    if (profile.location) {
        if (typeof profile.location !== "string" || profile.location.length > 50) {
            throw new Error ("Location field must be a string not longer than 50")
        }
    }
    if (profile.website) {
        if (typeof profile.website !== "string" || profile.website.length > 50) {
            throw new Error ("Website field must be a string not longer than 50")
        }
    }
    if (profile.birthday) {
        if (typeof profile.birthday !== "string" || profile.birthday.length > 24) {
            throw new Error ("Birthday field must be a string not longer than 24 (ISO length)")
        }
    }
    if (profile.description) {
        if (typeof profile.description !== "string" || profile.description.length > 500) {
            throw new Error ("Description field must be a string not longer than 500")
        }
    }

    // address is not necessary
    delete profile.address

    // map fields with corrected values
    Object.keys(profile).forEach(key => {
        if (key === "name") {
            profile[key] = profile[key] || ""
        }

        if (key === "avatar" || key === "cover") {
            const value = profile[key].hash
            profile[key] = { "@type": "image", value }
        }
    })

    // Validate payload size
    if ((new TextEncoder()).encode(profile).length > 3963) {
        throw new Error("Data exceed max length of 3963 bytes")
    }

    return profile
}

const fetchFeedOrDefault = async (topic, name, address) => {
    try {
        const feed = await readFeed(topic, name, address)
        return typeof feed === "string"
            ? JSON.parse(feed)
            : feed
    } catch (error) {
        console.error(error)
        return {}
    }
}