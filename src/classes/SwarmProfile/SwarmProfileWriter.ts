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

import { SwarmProfileTopicName } from "."
import SwarmBeeClient from "@/classes/SwarmBeeClient"
import SwarmImageIO from "@/classes/SwarmImage"
import { checkIsEthAddress } from "@/utils/ethereum"
import type { SwarmProfileWriterOptions } from "./types"
import type { SwarmImage } from "@/definitions/swarm-image"
import type { Profile, ProfileRaw } from "@/definitions/swarm-profile"

const ProfileProperties = [
  "address",
  "name",
  "avatar",
  "cover",
  "description",
  "location",
  "website",
  "birthday",
  "batchId"
]

/**
 * Load a profile from swarm hash or feed
 */
export default class SwarmProfileWriter {
  address: string
  loadedFromPrefetch: boolean = false

  private beeClient: SwarmBeeClient

  static avatarResponsiveSizes = [128, 256, 512]
  static coverResponsiveSizes = SwarmImageIO.Writer.defaultResponsiveSizes
  static topicName = "EthernaProfile"

  constructor(address: string, opts: SwarmProfileWriterOptions) {
    this.address = address
    this.beeClient = opts.beeClient
  }

  // Public methods

  /**
   * Create or Update profile info
   * 
   * @param profile The updated profile
   * @return The new hash of the profile
   */
  async update(profile: Profile) {
    if (!this.beeClient.signer) throw new Error("Enable your wallet to update your profile")
    const fetch = this.beeClient.getFetch()

    // Get validated profiles
    const baseProfile = pick(this.validatedProfile(profile), ProfileProperties)

    console.log("PROFILE", baseProfile)


    // Upload json
    const serializedJson = new TextEncoder().encode(JSON.stringify(baseProfile))
    const batchId = await this.beeClient.getBatchId()
    const reference = (await this.beeClient.uploadFile(batchId, serializedJson, undefined, { fetch })).reference

    // update feed
    const topic = this.beeClient.makeFeedTopic(SwarmProfileTopicName)
    const writer = this.beeClient.makeFeedWriter("sequence", topic)
    await writer.upload(batchId, reference)

    return reference
  }

  // Private methods

  /**
   * Validate a profile by checking its props are in the correct format
   * 
   * @param profile Profile to validate
   * @returns The validated profile
   */
  private validatedProfile = (profile: Profile) => {
    // Object validation
    if (typeof profile !== "object") {
      throw new Error("Profile must be an object")
    }

    const validatedProfile = { ...profile } as ProfileRaw

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
    validatedProfile.avatar = this.parseImage(profile.avatar)
    validatedProfile.cover = this.parseImage(profile.cover)
    validatedProfile.batchId = this.beeClient.userBatches[0].id ?? profile.batchId

    return validatedProfile
  }

  /**
   * Parse image to raw image
   * 
   * @param image The image object
   * @returns The raw Swarm Image
   */
  private parseImage = (image: SwarmImage | null) => {
    if (image) {
      return new SwarmImageIO.Reader(image, {
        beeClient: this.beeClient
      }).imageRaw
    }
    return null
  }
}
