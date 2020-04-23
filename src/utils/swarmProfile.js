import axios from "axios"
import web3 from "web3"

import { shortenEthAddr, checkIsEthAddress } from "./ethFuncs"
import { readFeed, updatedFeed } from "./feedFuncs"
import { getResourceUrl, isValidHash, uploadResourceToSwarm } from "./swarm"

const EthernaTopicName = "Etherna"
const EthernaTopic = web3.utils.padRight(web3.utils.fromAscii(EthernaTopicName), 64)
const EthernaVideoName = "EthernaVideo"

export const getProfile = async address => {
    try {
        const baseProfile = await resolveProfile(EthernaTopic, null, address)
        const ethernaVideoProfile = await resolveProfile(EthernaTopic, EthernaVideoName, address)
        return {
            ...baseProfile,
            ...ethernaVideoProfile
        }
    } catch (error) {
        console.error(error)

        return {
            address,
            name: shortenEthAddr(address),
            avatar: null,
            cover: null
        }
    }
}

export const getProfiles = async addresses => {
    try {
        let profiles = []
        addresses.forEach(async address => {
            const profile = await getProfile(address)
            profiles.push(profile)
        })
        return profiles
    } catch (error) {
        console.error(error)
        return []
    }
}

export const updateProfile = async (profile) => {
    const address = profile.address

    // Split profile data into "base profile" and "etherna video profile"
    let baseProfile = {
        name: profile.name,
        avatar: profile.avatar,
        cover: profile.cover
    }
    let ethernaVideoProfile = web3.utils._.omit(profile, "name", "avatar", "cover")

    // Get validated profiles
    baseProfile = await validatedProfile(baseProfile)
    ethernaVideoProfile = await validatedProfile(ethernaVideoProfile)

    // Update feed
    await updatedFeed(EthernaTopic, undefined, address, baseProfile)
    await updatedFeed(EthernaTopic, EthernaVideoName, address, ethernaVideoProfile)
}


// Private utils functions
const resolveProfile = async (topic, name, address) => {
    const profile = await fetchFeedOrDefault(topic, name, address)
    return {
        address,
        name: shortenEthAddr(address),
        location: '',
        website: '',
        birthday: '',

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

    // address is not necessary
    delete profile.address

    // map fields with corrected values
    Object.keys(profile).forEach(async key => {
        if (key === "name") {
            profile[key] = profile[key] || ""
        }

        if (key === "avatar" || key === "cover") {
            const type = "@image"
            const value = profile[key].hash
            profile[key] = { type, value }
        }

        if (key === "description") {
            const type = "@text"
            const value = profile[key] && profile[key] !== ""
                ? (await uploadResourceToSwarm(profile[key].toString().slice(0, 500)))
                : ""
            profile[key] = { type, value }
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
        return JSON.parse(feed)
    } catch (error) {
        return {}
    }
}