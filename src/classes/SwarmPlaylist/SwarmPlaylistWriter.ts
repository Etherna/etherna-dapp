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

import { AES } from "crypto-ts"
import type { Reference } from "@ethersphere/bee-js"

import SwarmPlaylistIO from "."
import SwarmBeeClient from "@classes/SwarmBeeClient"
import { urlOrigin } from "@utils/urls"
import type { SwarmPlaylistWriterOptions } from "./types"
import type { SwarmPlaylistRaw, SwarmPlaylist, EncryptedSwarmPlaylistData } from "@definitions/swarm-playlist"

/**
 * Handles upload of images on swarm and created responsive source
 */
export default class SwarmImageWriter {
  playlist: SwarmPlaylist

  private isFeedManifest: boolean
  private beeClient: SwarmBeeClient
  private currentIndex: string

  constructor(playlist: SwarmPlaylist, opts: SwarmPlaylistWriterOptions) {
    this.playlist = playlist
    this.beeClient = opts.beeClient
    this.currentIndex = urlOrigin(opts.indexUrl)!
    this.isFeedManifest = opts.initialType === "public" && !!playlist.reference
  }

  /**
   * Upload playlist data
   * 
   * @returns The reference of the playlist
   */
  async upload(): Promise<string> {
    if (this.playlist.type === "private" && !this.playlist.encryptionPassword) {
      throw new Error("Please insert a password for a private playlist")
    }

    const batchId = await this.beeClient.getBatchId()

    let encryptedReference: string
    if (this.playlist.type === "private") {
      const playlistData: EncryptedSwarmPlaylistData = {
        videos: this.playlist.videos ?? [],
        description: this.playlist.description,
      }
      const encryptedData = AES.encrypt(JSON.stringify(playlistData), this.playlist.encryptionPassword!)
      encryptedReference = (await this.beeClient.uploadFile(batchId, encryptedData.toString())).reference
    }

    const rawPlaylist: SwarmPlaylistRaw = this.playlist.type === "private" ? {
      type: "private",
      id: this.playlist.id,
      name: this.playlist.name,
      created_at: this.playlist.created_at,
      updated_at: this.playlist.updated_at,
      owner: this.playlist.owner,
      encryptedReference: encryptedReference!,
    } : {
      type: this.playlist.type,
      id: this.playlist.id,
      name: this.playlist.name,
      created_at: this.playlist.created_at,
      updated_at: this.playlist.updated_at,
      owner: this.playlist.owner,
      videos: this.playlist.videos ?? [],
      description: this.playlist.description ?? null,
    }

    let { reference } = await this.beeClient.uploadFile(batchId, JSON.stringify(rawPlaylist))

    if (this.playlist.type === "public") {
      // create public feed for playlist subscription
      const topicName = SwarmPlaylistIO.getFeedTopicName(this.playlist.id, this.currentIndex)
      const topic = this.beeClient.makeFeedTopic(topicName)
      const writer = this.beeClient.makeFeedWriter("sequence", topic)
      await writer.upload(batchId, reference)
      if (!this.isFeedManifest) {
        reference = await this.beeClient.createFeedManifest(batchId, "sequence", topic, this.playlist.owner)
      } else {
        reference = this.playlist.reference as Reference
      }
    }

    return reference
  }
}
