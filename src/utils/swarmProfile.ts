import pick from "lodash/pick"
import web3 from "web3"
import { BzzFeed, FeedParams } from "@erebos/bzz-feed"

import { checkIsEthAddress } from "./ethFuncs"
import { getResourceUrl, isValidHash } from "./swarm"
import { store } from "@state/store"
import { Bzz, Response } from "@erebos/bzz"

const ProfileAuthority = "0x0"
const ProfileTopic = web3.utils.padRight(web3.utils.fromAscii("EthernaUserIdentity"), 64)
const ProfileProperties = ["address", "name", "avatar", "cover", "description", "location", "website", "birthday"]

export type SwarmResource = {
  /**  Resource type */
  "@type": string
  /**  Hash of the resource */
  value: string
  /**  Is swarm raw resource */
  isRaw: boolean
}

export type SwarmImage = {
  /**  Url of the resource */
  url: string
  /**  Hash of the resource on Swarm */
  hash: string
  /**  Is swarm raw resource */
  isRaw: boolean
}

export type Profile = {
  /**  Profile address */
  address: string
  /**  Swarm manifest hash */
  manifest?: string|null
  /**  Name of the Profile */
  name: string|null
  /**  Description of the Profile */
  description?: string|null
  /**  User's avatar */
  avatar?: SwarmImage|SwarmResource
  /**  User's cover */
  cover?: SwarmImage|SwarmResource
  /** User's location */
  location?: string
  /** User's website */
  website?: string
  /** User's birthday */
  birthday?: string
}

/**
 * Get the profile information of a address
 * @param manifest Manifest with profile info
 * @param address Address for fallback feed
 */
export const getProfile = async (manifest: string|null|undefined, address: string) => {
  const profile = await resolveProfile(manifest, address)
  return profile
}

/**
 * Get a list of profiles
 * @param identities Array of manifest hash
 */
export const getProfiles = async (identities: { address: string, manifest: string }[]) => {
  try {
    const promises = identities.map(identity => getProfile(identity.manifest, identity.address))
    const profiles = await Promise.all(promises)

    return profiles
  } catch (error) {
    console.error(error)

    return identities.map(ide => ({
      address: ide.address,
      manifest: ide.manifest,
      name: null,
      description: null
    } as Profile))
  }
}

/**
 * Update a user's feeds for the profile
 * @param profile Profile information
 * @returns The new manifest hash
 */
export const updateProfile = async (profile: Profile) => {
  const { bzzClient } = store.getState().env

  // Get validated profiles
  const baseProfile = pick(validatedProfile(profile), ProfileProperties)

  // Upload json
  const manifest: string = await bzzClient.uploadData(baseProfile, {
    contentType: "text/json",
  })

  return manifest
}

// Private utils functions

/**
 * Resolve a profile by fetching feeds and resolving images
 * @param manifest Manifest with profile info
 * @param address Address for fallback feed
 */
const resolveProfile = async (manifest: string|null|undefined, address: string) => {
  const { bzzClient } = store.getState().env
  let profile: Profile = {
    address,
    manifest,
    name: "",
    description: "",
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
      avatar: resolveImage(profile.avatar as SwarmResource|undefined),
      cover: resolveImage(profile.cover as SwarmResource|undefined),
    },
    ProfileProperties
  ) as Profile

  return profile
}

/**
 * Resolve an image by parsing its url
 * @param imgObj
 */
export const resolveImage = (imgObj: SwarmResource|undefined) => {
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
  } as SwarmImage
}

/**
 * Validate a profile by checking its props are in the correct format
 * @param profile Profile to validate
 */
export const validatedProfile = (profile: Profile) => {
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
      const value = (profile[key] as SwarmImage)!.hash
      const isRaw = (profile[key] as SwarmImage)!.isRaw
      const image: SwarmResource = { "@type": "image", value, isRaw }
      profile[key] = image
    }
  })

  // Validate payload size
  if (new TextEncoder().encode(JSON.stringify(profile)).length > 3963) {
    throw new Error("Data exceed max length of 3963 bytes")
  }

  return profile
}


/**
 * Fetch the feed or a empty object if non existing
 * @param bzz Bzz client
 * @param feed Feed props
 * @returns Feed data
 */
const fetchFeedOrDefault = async (bzz: Bzz<unknown, Response<unknown>>, feed: FeedParams) => {
  const bzzFeed = new BzzFeed({ bzz })
  try {
    const meta = await bzzFeed.getContent(feed)

    return typeof meta === "string" ? JSON.parse(meta) : meta || {}
  } catch (error) {
    return {}
  }
}
