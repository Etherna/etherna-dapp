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

import { AES, enc } from "crypto-ts"

import SwarmPlaylistIO from "."
import SwarmBeeClient from "@classes/SwarmBeeClient"
import { urlOrigin } from "@utils/urls"
import type { SwarmPlaylistReaderOptions } from "./types"
import type { SwarmPlaylistRaw, SwarmPlaylist, EncryptedSwarmPlaylistData } from "@definitions/swarm-playlist"

/**
 * Load playlist data
 */
export default class SwarmPlaylistReader {
  playlist?: SwarmPlaylist

  private reference?: string
  private id?: string
  private owner?: string
  private beeClient: SwarmBeeClient
  private currentIndex: string

  constructor(
    reference: string | undefined,
    playlist: SwarmPlaylist | undefined,
    opts: SwarmPlaylistReaderOptions,
  ) {
    this.playlist = playlist
    this.reference = reference
    this.beeClient = opts.beeClient
    this.currentIndex = urlOrigin(opts.indexUrl)!
    this.id = opts.id
    this.owner = opts.owner
  }

  /**
   * Download playlist data
   * 
   * @returns The parsed playlist
   */
  async download(): Promise<SwarmPlaylist> {
    if (!this.reference && (!this.id || !this.owner)) {
      throw new Error("Cannot fetch playlist. Missing reference or identifier.")
    }

    if (!this.reference) {
      const topic = SwarmPlaylistIO.getFeedTopicName(this.id!, this.currentIndex)
      const reader = this.beeClient.makeFeedReader("sequence", topic, this.owner!)
      this.reference = (await reader.download()).reference
    }

    const playlistData = await this.beeClient.downloadFile(this.reference)
    const rawPlaylist = playlistData.data.json() as SwarmPlaylistRaw
    const playlist: SwarmPlaylist = {
      id: rawPlaylist.id,
      reference: this.reference,
      name: rawPlaylist.name || "",
      owner: rawPlaylist.owner || this.owner || "",
      created_at: rawPlaylist.created_at,
      updated_at: rawPlaylist.updated_at,
      type: rawPlaylist.type,
      encryptedReference: rawPlaylist.type === "private" ? rawPlaylist.encryptedReference : undefined,
      encryptionPassword: undefined,
      encryptedData: undefined,
      videos: rawPlaylist.type !== "private" ? rawPlaylist.videos : undefined,
      description: rawPlaylist.type !== "private" ? rawPlaylist.description || "" : undefined,
    }

    if (rawPlaylist.type === "private" && !rawPlaylist.encryptedReference) {
      throw new Error("Private playlist missing encrypted reference")
    }

    if (rawPlaylist.type === "private") {
      const encryptedData = await this.beeClient.downloadFile(rawPlaylist.encryptedReference)
      playlist.encryptedData = encryptedData.data.text()
    }

    this.playlist = playlist
    return playlist
  }

  /**
   * Decrypt private playlist
   * 
   * @param password Playlist password
   */
  decrypt(password: string) {
    if (!this.playlist?.encryptedData) {
      throw new Error("There is no encrypted data to decrypt")
    }
    try {
      const decryptedData = AES.decrypt(this.playlist.encryptedData, password).toString(enc.Utf8)
      const playlistData = JSON.parse(decryptedData) as EncryptedSwarmPlaylistData
      this.playlist.encryptionPassword = password
      this.playlist.videos = playlistData.videos
      this.playlist.description = playlistData.description || ""
    } catch (error) {
      throw new Error("Cannot unlock playlist. Make sure the password is correct.")
    }
  }
}