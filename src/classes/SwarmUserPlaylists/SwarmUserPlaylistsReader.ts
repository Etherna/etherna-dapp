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
import SwarmPlaylistIO from "@/classes/SwarmPlaylist"
import type { SwarmUserPlaylistsDownloadOptions, SwarmUserPlaylistsReaderOptions } from "./types"
import type { SwarmPlaylist, SwarmUserPlaylistsRaw } from "@/definitions/swarm-playlist"

/**
 * Load playlist data
 */
export default class SwarmUserPlaylistsReader {
  rawPlaylists?: SwarmUserPlaylistsRaw | null
  channelPlaylist?: SwarmPlaylist
  savedPlaylist?: SwarmPlaylist
  customPlaylists?: SwarmPlaylist[]

  private owner: string
  private beeClient: SwarmBeeClient

  constructor(owner: string, opts: SwarmUserPlaylistsReaderOptions) {
    this.owner = owner
    this.beeClient = opts.beeClient
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
    // this.channelPlaylist = await this.resolvePlaylistOrDefault(
    //   this.rawPlaylists?.channel,
    //   SwarmUserPlaylistsIO.getDefaultChannelPlaylist(this.owner)
    // )
    this.channelPlaylist = await this.depracated_resolvePlaylistFromId(
      SwarmUserPlaylistsIO.getDefaultChannelPlaylist(this.owner)
    )
  }

  private async resolveSaved() {
    // this.savedPlaylist = await this.resolvePlaylistOrDefault(
    //   this.rawPlaylists?.saved,
    //   SwarmUserPlaylistsIO.getDefaultSavedPlaylist(this.owner)
    // )
    this.savedPlaylist = await this.depracated_resolvePlaylistFromId(
      SwarmUserPlaylistsIO.getDefaultSavedPlaylist(this.owner)
    )
  }

  private async resolveCustom() {
    this.customPlaylists = await Promise.all(
      (this.rawPlaylists?.custom ?? []).map(reference => this.resolvePlaylistOrDefault(
        reference,
        SwarmUserPlaylistsIO.getDefaultCustomPlaylist(this.owner)
      ))
    )
  }

  private async depracated_resolvePlaylistFromId(fallback: SwarmPlaylist) {
    // feeds root manifest seems not to be in sync with feed reference in production
    // loading playlist directly from id until this is fixed
    const id = fallback.id
    try {
      const reader = new SwarmPlaylistIO.Reader(undefined, undefined, {
        id,
        beeClient: this.beeClient,
        owner: this.owner,
      })
      return await reader.download()
    } catch (error) {
      return fallback
    }
  }

  private async resolvePlaylistOrDefault(reference: string | undefined, fallback: SwarmPlaylist) {
    if (!reference) return fallback
    try {
      const reader = new SwarmPlaylistIO.Reader(reference, undefined, {
        beeClient: this.beeClient,
        owner: this.owner,
      })
      return await reader.download()
    } catch (error) {
      return fallback
    }
  }

  private async fetchFeedOrDefault(): Promise<SwarmUserPlaylistsRaw | null> {
    try {
      const topic = this.beeClient.makeFeedTopic(SwarmUserPlaylistsIO.getFeedTopicName())
      const reader = this.beeClient.makeFeedReader("sequence", topic, this.owner)
      const { reference } = await reader.download()
      const data = await this.beeClient.downloadFile(reference)
      const usersPlaylists = data.data.json() as SwarmUserPlaylistsRaw
      usersPlaylists.v = SwarmUserPlaylistsIO.lastVersion
      return usersPlaylists
    } catch (error) {
      return null
    }
  }
}
