/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import pick from "lodash/pick"

import { getDefaultProfile, SwarmProfileTopicName } from "."
import SwarmImageIO from "@classes/SwarmImage"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import type { SwarmProfileReaderOptions } from "./types"
import type { SwarmImageRaw } from "@definitions/swarm-image"
import type { Profile, ProfileRaw } from "@definitions/swarm-profile"

const ProfileProperties = ["address", "name", "avatar", "cover", "description", "location", "website", "birthday"]

/**
 * Load a profile from swarm hash or feed
 */
export default class SwarmProfileReader {
  address: string
  profile?: Profile
  loadedFromPrefetch: boolean = false

  private beeClient: SwarmBeeClient
  private fetchFromCache: boolean
  private updateCache: boolean

  static avatarResponsiveSizes = [128, 256, 512]
  static coverResponsiveSizes = SwarmImageIO.Writer.defaultResponsiveSizes

  constructor(address: string, opts: SwarmProfileReaderOptions) {
    this.beeClient = opts.beeClient
    this.address = address
    this.fetchFromCache = opts.fetchFromCache || true
    this.updateCache = opts.updateCache || true

    if (this.hasPrefetch) {
      this.loadProfileFromPrefetch()
    } else if (this.hasCache && this.fetchFromCache) {
      this.loadProfileFromCache()
    }
  }

  // Props
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
   * Download profile data
   * 
   * @param forced If true will download the profile even with prefetched data (default = false)
   * @returns The profile object
   */
  async download(forced = false) {
    if (this.loadedFromPrefetch && !forced) return this.profile
    if (!this.address || this.address === "0x0") return undefined

    let profile = getDefaultProfile(this.address) as ProfileRaw

    // Fetch profile from feed
    try {
      const topic = this.beeClient.makeFeedTopic(SwarmProfileTopicName)
      const reader = this.beeClient.makeFeedReader("sequence", topic, this.address)
      const feed = await reader.download()
      const profileResp = await this.beeClient.downloadFile(feed.reference)
      profile = profileResp.data.json() as Profile
    } catch { }

    const parsedProfile = pick(
      {
        ...profile,
        avatar: this.parseRawImage(profile.avatar),
        cover: this.parseRawImage(profile.cover),
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
   * Manually set the profile info
   * 
   * @param profile The profile info
   */
  setProfile(profile: Profile) {
    this.profile = profile
    this.address = profile.address
  }

  // Private methods

  /**
   * Parse raw image in image
   * 
   * @param imageRaw The raw image object
   * @returns The parsed Swarm Image
   */
  private parseRawImage = (imageRaw: SwarmImageRaw | null) => {
    if (imageRaw) {
      return new SwarmImageIO.Reader(imageRaw, {
        beeClient: this.beeClient
      }).image
    }
    return null
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