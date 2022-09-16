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

import SwarmPlaylistIO from "."
import type { SwarmPlaylistWriterOptions } from "./types"
import type BeeClient from "@/classes/BeeClient"
import type {
  SwarmPlaylistRaw,
  SwarmPlaylist,
  EncryptedSwarmPlaylistData,
  SwarmPlaylistVideo,
  SwarmPlaylistVideoRaw,
} from "@/definitions/swarm-playlist"

/**
 * Handles upload of images on swarm and created responsive source
 */
export default class SwarmImageWriter {
  playlist: SwarmPlaylist
  playlistRaw: SwarmPlaylistRaw

  private beeClient: BeeClient

  constructor(playlist: SwarmPlaylist, opts: SwarmPlaylistWriterOptions) {
    this.playlist = playlist
    this.playlistRaw = this.parsePlaylistToRaw(playlist, playlist.encryptedReference)
    this.beeClient = opts.beeClient
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

    const batchId = await this.beeClient.stamps.fetchBestBatchId()

    let encryptedReference: string | undefined
    if (this.playlist.type === "private") {
      const playlistData: EncryptedSwarmPlaylistData = {
        videos: this.parseVideos(this.playlist.videos ?? []),
        description: this.playlist.description,
      }
      const encryptedData = AES.encrypt(
        JSON.stringify(playlistData),
        this.playlist.encryptionPassword!
      )
      encryptedReference = (
        await this.beeClient.bzz.upload(encryptedData.toString(), {
          batchId,
          headers: {
            // "x-etherna-reason": "swarm-playlist-encrypted-data-upload",
          },
        })
      ).reference
    }

    this.playlistRaw = this.parsePlaylistToRaw(this.playlist, encryptedReference)
    this.playlistRaw.updatedAt = +new Date()

    let { reference } = await this.beeClient.bzz.upload(JSON.stringify(this.playlistRaw), {
      batchId,
      headers: {
        "content-type": "application/json",
        // "x-etherna-reason": "swarm-playlist-upload",
      },
    })

    if (this.playlist.type === "public") {
      // create public feed for playlist subscription
      const topicName = SwarmPlaylistIO.getFeedTopicName(this.playlist.id)
      const feed = this.beeClient.feed.makeFeed(
        topicName,
        this.beeClient.signer!.address,
        "sequence"
      )
      const writer = this.beeClient.feed.makeWriter(feed)
      await writer.upload(reference, {
        batchId,
        headers: {
          // "x-etherna-reason": "swarm-playlist-feed-upload",
        },
      })
      const feedManifest = await this.beeClient.feed.createRootManifest(feed, {
        batchId,
        headers: {
          // "x-etherna-reason": "swarm-playlist-feed-root-manifest",
        },
      })
      reference = feedManifest
    }

    return reference
  }

  removeVideos(references: string[]) {
    const videos = (this.playlist.videos ?? []).filter(
      video => !references.includes(video.reference)
    )
    this.playlist.videos = videos
  }

  private parsePlaylistToRaw(
    playlist: SwarmPlaylist,
    encryptedReference: string | undefined
  ): SwarmPlaylistRaw {
    return playlist.type === "private"
      ? {
          type: "private",
          id: playlist.id,
          name: playlist.name || undefined,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
          owner: playlist.owner,
          encryptedReference: encryptedReference!,
          v: SwarmPlaylistIO.lastVersion,
        }
      : {
          type: playlist.type,
          id: playlist.id,
          name: playlist.name,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
          owner: playlist.owner,
          videos: this.parseVideos(playlist.videos ?? []),
          description: playlist.description ?? null,
          v: SwarmPlaylistIO.lastVersion,
        }
  }

  private parseVideos(videos: SwarmPlaylistVideo[]): SwarmPlaylistVideoRaw[] {
    return videos.map(video => ({
      r: video.reference,
      t: video.title,
      a: video.addedAt,
      p: video.publishedAt,
    }))
  }
}
