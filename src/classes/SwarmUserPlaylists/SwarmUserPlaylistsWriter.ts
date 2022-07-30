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

import SwarmUserPlaylistsIO from "."
import SwarmBeeClient from "@/classes/SwarmBeeClient"
import { urlOrigin } from "@/utils/urls"
import type { SwarmUserPlaylistsWriterOptions } from "./types"
import type { SwarmUserPlaylistsRaw } from "@/definitions/swarm-playlist"

/**
 * Handles upload of images on swarm and created responsive source
 */
export default class SwarmUserPlaylistsWriter {
  playlistsRaw: SwarmUserPlaylistsRaw

  private beeClient: SwarmBeeClient

  constructor(playlistsRaw: SwarmUserPlaylistsRaw, opts: SwarmUserPlaylistsWriterOptions) {
    this.playlistsRaw = playlistsRaw
    this.beeClient = opts.beeClient
  }

  /**
   * Upload playlists data
   */
  async upload() {
    const batchId = await this.beeClient.getBatchId()

    this.playlistsRaw.v = SwarmUserPlaylistsIO.lastVersion

    const { reference } = await this.beeClient.uploadFile(batchId, JSON.stringify(this.playlistsRaw))

    const topic = this.beeClient.makeFeedTopic(SwarmUserPlaylistsIO.getFeedTopicName())
    const writer = this.beeClient.makeFeedWriter("sequence", topic)
    await writer.upload(batchId, reference)
  }
}
