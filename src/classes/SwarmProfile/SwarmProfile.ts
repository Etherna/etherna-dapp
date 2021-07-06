import pick from "lodash/pick"

import { Profile, ProfileRaw } from "./types"
import SwarmImage from "@classes/SwarmImage"
import { SwarmImageRaw } from "@classes/SwarmImage/types"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import { checkIsEthAddress } from "@utils/ethFuncs"

const ProfileProperties = ["address", "name", "avatar", "cover", "description", "location", "website", "birthday"]

type SwarmProfileOptions = {
  address: string
  hash?: string
  beeClient: SwarmBeeClient
  fetchFromCache?: boolean
  updateCache?: boolean
}

/**
 * Load a profile from swarm hash or feed
 */
export default class SwarmProfile {
  address: string
  hash?: string
  beeClient: SwarmBeeClient
  fetchFromCache: boolean
  updateCache: boolean

  profile: Profile
  loadedFromPrefetch: boolean = false

  static avatarResponsiveSizes = [128, 256, 512]
  static coverResponsiveSizes = SwarmImage.defaultResponsiveSizes
  static topicName = "EthernaProfile"

  constructor(opts: SwarmProfileOptions) {
    this.hash = opts.hash
    this.address = opts.address
    this.beeClient = opts.beeClient
    this.fetchFromCache = opts.fetchFromCache || true
    this.updateCache = opts.updateCache || true
    this.profile = SwarmProfile.defaultProfile(this.address)

    if (this.hasPrefetch) {
      this.loadProfileFromPrefetch()
    } else if (this.hasCache && this.fetchFromCache) {
      this.loadProfileFromCache()
    }
  }

  // Props
  get name(): string | null {
    return this.profile.name
  }
  set name(value: string | null) {
    this.profile.name = value
  }

  get description(): string | null | undefined {
    return this.profile.description
  }
  set description(value: string | null | undefined) {
    this.profile.description = value
  }

  get avatar(): SwarmImage | undefined {
    return this.profile.avatar
  }
  set avatar(value: SwarmImage | undefined) {
    this.profile.avatar = value
  }

  get cover(): SwarmImage | undefined {
    return this.profile.cover
  }
  set cover(value: SwarmImage | undefined) {
    this.profile.cover = value
  }

  get hasPrefetch(): boolean {
    const prefetchProfile = window.prefetchData?.profile
    return !!prefetchProfile && prefetchProfile.address === this.address
  }

  get hasCache(): boolean {
    // TODO
    return false
  }


  // Public methods

  /**
   * Download profile info
   * @param forced If true will download the profile even with prefetched data (default = false)
   * @returns The profile object
   */
  async downloadProfile(forced = false) {
    if (this.loadedFromPrefetch && !forced) return this.profile

    let profile = SwarmProfile.defaultProfile(this.address) as ProfileRaw

    try {
      if (!this.hash) throw new Error("No hash! Fallback to feed.")

      // Default hash profile data
      const resp = await this.beeClient.downloadData(this.hash)
      const rawProfile = resp.json() as ProfileRaw

      profile = { ...profile, ...rawProfile }
    } catch (error) {
      // Fetch profile from feed
      try {
        const topic = this.beeClient.makeFeedTopic(SwarmProfile.topicName)
        const feedReader = this.beeClient.makeFeedReader("sequence", topic, this.address)
        const feedUpdate = await feedReader.download()
        const feedProfile = await this.fetchFeedOrDefault(feedUpdate.reference)
        profile = { ...profile, ...feedProfile }
      } catch { }
    }

    const parsedProfile = pick(
      {
        ...profile,
        avatar: this.parseImage(profile.avatar, SwarmProfile.avatarResponsiveSizes),
        cover: this.parseImage(profile.cover, SwarmProfile.coverResponsiveSizes),
      },
      ProfileProperties
    ) as Profile

    this.profile = parsedProfile

    if (this.updateCache) {
      this.updateProfileCache(parsedProfile)
    }

    return parsedProfile
  }

  /**
   * Create or Update profile info
   * @param profile The updated profile
   * @return The new hash of the profile
   */
  async updateProfile(profile: Profile) {
    // Get validated profiles
    const baseProfile = pick(this.validatedProfile(profile), ProfileProperties)

    // Upload json
    const serializedJson = new TextEncoder().encode(JSON.stringify(baseProfile))
    const batchId = await this.beeClient.getBatchId()
    const reference = await this.beeClient.uploadData(batchId, serializedJson)

    // update feed
    if (this.beeClient.signer) {
      const topic = this.beeClient.makeFeedTopic(SwarmProfile.topicName)
      const writer = this.beeClient.makeFeedWriter("sequence", topic)
      await writer.upload(batchId, reference)
    }

    return reference
  }

  /**
   * Manually set the profile info
   * @param profile The profile info
   */
  setProfile(profile: Profile) {
    this.profile = profile
    this.address = profile.address
    this.hash = profile.manifest || undefined
  }

  static defaultProfile(address: string): Profile {
    return {
      address,
      name: "",
      description: "",
    }
  }


  // Private methods

  /**
   * Fetch the profile from a feed or return empty object
   * @param reference Reference string
   * @returns The profile object
   */
  private async fetchFeedOrDefault(reference: string): Promise<object> {
    try {
      const data = await this.beeClient.downloadData(reference)
      return data.json()
    } catch (error) {
      return {}
    }
  }

  /**
   * Validate a profile by checking its props are in the correct format
   * @param profile Profile to validate
   * @returns The validated profile
   */
  private validatedProfile = (profile: Profile) => {
    // Object validation
    if (typeof profile !== "object") {
      throw new Error("Profile must be an object")
    }

    const validatedProfile = { ...profile } as ProfileRaw

    delete validatedProfile.manifest

    if (!checkIsEthAddress(validatedProfile.address)) {
      throw new Error("Address field is required and must be a valid ethereum address")
    }
    if (validatedProfile.name) {
      if (typeof validatedProfile.name !== "string" || validatedProfile.name.length > 50) {
        throw new Error("Name field must be a string not longer than 50")
      }
      validatedProfile.name = validatedProfile.name ?? ""
    }
    if (validatedProfile.location) {
      if (typeof validatedProfile.location !== "string" || validatedProfile.location.length > 50) {
        throw new Error("Location field must be a string not longer than 50")
      }
    }
    if (validatedProfile.website) {
      if (typeof validatedProfile.website !== "string" || validatedProfile.website.length > 50) {
        throw new Error("Website field must be a string not longer than 50")
      }
    }
    if (validatedProfile.birthday) {
      if (typeof validatedProfile.birthday !== "string" || validatedProfile.birthday.length > 24) {
        throw new Error("Birthday field must be a string not longer than 24 (ISO length)")
      }
    }
    if (validatedProfile.description) {
      if (typeof validatedProfile.description !== "string" || validatedProfile.description.length > 500) {
        throw new Error("Description field must be a string not longer than 500")
      }
    }
    validatedProfile.avatar = profile.avatar?.imageRaw
    validatedProfile.cover = profile.cover?.imageRaw

    return validatedProfile
  }

  /**
   * Resolve an image by parsing its object
   * @param imageRaw The image object
   * @returns The parsed Swarm Image
   */
  private parseImage = (imageRaw: SwarmImageRaw | undefined, responsiveSizes: number[]) => {
    if (imageRaw) {
      return new SwarmImage(imageRaw, {
        beeClient: this.beeClient,
        isResponsive: true,
        responsiveSizes
      })
    }
    return undefined
  }

  private loadProfileFromPrefetch() {
    const prefetchProfile = window.prefetchData?.profile
    if (prefetchProfile) {
      this.profile = prefetchProfile
      this.loadedFromPrefetch = true
    }
  }

  private loadProfileFromCache() {
    //
  }

  private updateProfileCache(profile: Profile) {
    //
  }

}
