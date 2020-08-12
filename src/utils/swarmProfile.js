import { pick } from "lodash"
import web3 from "web3"
import { BzzFeed } from "@erebos/bzz-feed"

import { checkIsEthAddress } from "./ethFuncs"
import { getResourceUrl, isValidHash } from "./swarm"
import { store } from "@state/store"

const ProfileAuthority = "0x0"
const ProfileTopic = web3.utils.padRight(web3.utils.fromAscii("EthernaUserIdentity"), 64)
const ProfileProperties = ["address", "name", "avatar", "cover", "description", "location", "website", "birthday"]

/**
 *
 * @typedef {object} SwarmResource
 * @property {string} "@type" Resource type
 * @property {string} value Hash of the resource
 * @property {boolean} isRaw Is swarm raw resource
 *
 * @typedef {object} SwarmImage
 * @property {string} url Url of the resource
 * @property {string} hash Hash of the resource on Swarm
 * @property {boolean} isRaw Is swarm raw resource
 *
 * @typedef {object} Profile
 * @property {string} address Profile address
 * @property {string} manifest Swarm manifest hash
 * @property {string} name Name of the Profile/Channel
 * @property {string} description Description of the Profile/Channel
 * @property {SwarmImage} avatar User's avatar
 * @property {SwarmImage} avatar User's cover
 *
 */

/**
 * Get the profile information of a address
 * @param {string} manifest Manifest with profile info
 * @param {string} address Address for fallback feed
 *
 * @returns {Profile}
 */
export const getProfile = async (manifest, address) => {
  const profile = await resolveProfile(manifest, address)
  return profile
}

/**
 * Get a list of profiles
 * @param {{ address: string, manifest: string }[]} identities Array of manifest hash
 * @returns {Profile[]}
 */
export const getProfiles = async identities => {
  try {
    const promises = identities.map(identity => getProfile(identity.manifest, identity.address))
    const profiles = await Promise.all(promises)

    return profiles
  } catch (error) {
    console.error(error)

    return identities.map(ide => ({
      address: ide.address,
      manifests: ide.manifest,
      name: null,
    }))
  }
}

/**
 * Update a user's feeds for the profile
 * @param {Profile} profile Profile information
 * @returns {string} The new manifest hash
 */
export const updateProfile = async profile => {
  const { bzzClient } = store.getState().env

  // Get validated profiles
  const baseProfile = pick(validatedProfile(profile), ProfileProperties)

  // Upload json
  const manifest = await bzzClient.uploadData(baseProfile, {
    contentType: "text/json",
  })

  return manifest
}

// Private utils functions

/**
 * Resolve a profile by fetching feeds and resolving images
 * @param {string} manifest Manifest with profile info
 * @param {string} address Address for fallback feed
 * @returns {Profile}
 */
const resolveProfile = async (manifest, address) => {
  const { bzzClient } = store.getState().env
  let profile = {
    address,
    name: null,
    description: null,
    location: null,
    website: null,
    birthday: null,
  }

  try {
    if (!manifest) throw new Error("No manifest!")

    const resp = await bzzClient.download(manifest)
    const manifestProfile = await resp.json()
    profile = {...profile, ...manifestProfile}
  } catch (error) {
    const feedProfile = await fetchFeedOrDefault(bzzClient, {
      topic: ProfileTopic,
      name: address,
      user: ProfileAuthority
    })
    profile = {...profile, ...feedProfile}
  }

  profile = pick(
    {
      ...profile,
      avatar: resolveImage(profile.avatar),
      cover: resolveImage(profile.cover),
    },
    ProfileProperties
  )

  return profile
}

/**
 * Resolve an image by parsing its url
 *
 * @param {SwarmResource} imgObj
 * @returns {SwarmImage}
 */
export const resolveImage = imgObj => {
  let url = null, hash = null, isRaw = false
  if (
    typeof imgObj === "object" &&
    "@type" in imgObj &&
    "value" in imgObj &&
    imgObj["@type"] === "image" &&
    isValidHash(imgObj.value)
  ) {
    url = getResourceUrl(imgObj.value, imgObj.isRaw)
    hash = imgObj.value
    isRaw = imgObj.isRaw || false
  }
  return {
    url,
    hash,
    isRaw
  }
}

/**
 * Validate a profile by checking its props are in the correct format
 * @param {Profile} profile Profile to validate
 * @returns {Profile}
 */
export const validatedProfile = profile => {
  // Object validation
  if (typeof profile !== "object") {
    throw new Error("Profile must be an object")
  }
  if (!checkIsEthAddress(profile.address)) {
    throw new Error("Address field is required and must be a valid ethereum address")
  }
  if (profile.name) {
    if (typeof profile.name !== "string" || profile.name.length > 50) {
      throw new Error("Name field must be a string not longer than 50")
    }
  }
  if (profile.location) {
    if (typeof profile.location !== "string" || profile.location.length > 50) {
      throw new Error("Location field must be a string not longer than 50")
    }
  }
  if (profile.website) {
    if (typeof profile.website !== "string" || profile.website.length > 50) {
      throw new Error("Website field must be a string not longer than 50")
    }
  }
  if (profile.birthday) {
    if (typeof profile.birthday !== "string" || profile.birthday.length > 24) {
      throw new Error("Birthday field must be a string not longer than 24 (ISO length)")
    }
  }
  if (profile.description) {
    if (typeof profile.description !== "string" || profile.description.length > 500) {
      throw new Error("Description field must be a string not longer than 500")
    }
  }

  // map fields with corrected values
  Object.keys(profile).forEach(key => {
    if (key === "name") {
      profile[key] = profile[key] || ""
    }

    if (key === "avatar" || key === "cover") {
      const value = profile[key].hash
      const isRaw = profile[key].isRaw
      profile[key] = { "@type": "image", value, isRaw }
    }
  })

  // Validate payload size
  if (new TextEncoder().encode(profile).length > 3963) {
    throw new Error("Data exceed max length of 3963 bytes")
  }

  return profile
}


/**
 * Fetch the feed or a empty object if non existing
 * @param {import("@erebos/bzz").Bzz} bzz Bzz client
 * @param {import("@erebos/bzz-feed").FeedParams} feed Feed props
 * @returns {object} Feed data
 */
const fetchFeedOrDefault = async (bzz, feed) => {
  const bzzFeed = new BzzFeed({ bzz })
  try {
    const meta = await bzzFeed.getContent(feed)

    return typeof meta === "string" ? JSON.parse(meta) : meta || {}
  } catch (error) {
    return {}
  }
}
