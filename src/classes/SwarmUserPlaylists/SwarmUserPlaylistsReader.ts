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
import SwarmBeeClient from "@classes/SwarmBeeClient"
import SwarmPlaylistIO from "@classes/SwarmPlaylist"
import { urlOrigin } from "@utils/urls"
import uuidv4 from "@utils/uuid"
import type { SwarmUserPlaylistsDownloadOptions, SwarmUserPlaylistsReaderOptions } from "./types"
import type { SwarmPlaylist, SwarmUserPlaylistsRaw } from "@definitions/swarm-playlist"

/**
 * Load playlist data
 */
export default class SwarmUserPlaylistsReader {
  rawPlaylists?: SwarmUserPlaylistsRaw
  channelPlaylist?: SwarmPlaylist
  savedPlaylist?: SwarmPlaylist
  customPlaylists?: SwarmPlaylist[]

  private owner: string
  private beeClient: SwarmBeeClient
  private currentIndex: string

  constructor(owner: string, opts: SwarmUserPlaylistsReaderOptions) {
    this.owner = owner
    this.beeClient = opts.beeClient
    this.currentIndex = urlOrigin(opts.indexUrl)!
  }

  /**
   * Download playlists data
   */
  async download(opts?: SwarmUserPlaylistsDownloadOptions): Promise<void> {
    this.rawPlaylists = await this.fetchFeedOrDefault()

    await Promise.allSettled([
      opts?.resolveChannel ? this.resolveChannel() : false,
      opts?.resolveSaved ? this.resolveSaved() : false,
      opts?.resolveCustom ? this.resolveCustom() : false,
    ].filter(Boolean))
  }

  private async resolveChannel() {
    this.channelPlaylist = await this.resolvePlaylistOrDefault(this.rawPlaylists?.channel, {
      id: "__channel",
      reference: null,
      name: "",
      owner: this.owner,
      type: "public",
      videos: [],
      created_at: +new Date(),
      updated_at: +new Date(),
    })
  }

  private async resolveSaved() {
    this.savedPlaylist = await this.resolvePlaylistOrDefault(this.rawPlaylists?.saved, {
      id: "__saved",
      reference: null,
      name: "",
      owner: this.owner,
      type: "public",
      videos: [],
      created_at: +new Date(),
      updated_at: +new Date(),
    })
  }

  private async resolveCustom() {
    this.customPlaylists = await Promise.all(
      (this.rawPlaylists?.custom ?? []).map(reference => this.resolvePlaylistOrDefault(reference, {
        id: uuidv4(),
        reference,
        name: "Untitle",
        owner: this.owner,
        type: "public",
        videos: [],
        created_at: +new Date(),
        updated_at: +new Date(),
      }))
    )
  }

  private async resolvePlaylistOrDefault(reference: string | undefined, fallback: SwarmPlaylist) {
    if (!reference) return fallback
    try {
      const reader = new SwarmPlaylistIO.Reader(reference, undefined, {
        beeClient: this.beeClient,
        indexUrl: this.currentIndex,
        owner: this.owner,
      })
      return await reader.download()
    } catch (error) {
      return fallback
    }
  }

  private async fetchFeedOrDefault(): Promise<SwarmUserPlaylistsRaw | undefined> {
    try {
      const topic = this.beeClient.makeFeedTopic(SwarmUserPlaylistsIO.getFeedTopicName(this.currentIndex))
      const reader = this.beeClient.makeFeedReader("sequence", topic, this.owner)
      const { reference } = await reader.download()
      const data = await this.beeClient.downloadFile(reference)
      return data.data.json() as SwarmUserPlaylistsRaw
    } catch (error) {
      return undefined
    }
  }
}
