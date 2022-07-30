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

export type SwarmUserPlaylistsRaw = {
  /** Reference to the channel playlist */
  channel?: string
  /** Reference to the saved videos playlist */
  saved?: string
  /** Reference list of custom playlists */
  custom?: string[]
  /** Schema version */
  v?: number
}

export type SwarmPlaylistRaw = {
  /** Playlist id (used for feed update) */
  id: string
  /** Playlist name (undefined for __channel & __saved) */
  name: string | undefined
  /** Playlist owner */
  owner: string
  /** Playlist creation timestamp */
  createdAt: number
  /** Playlist update timestamp */
  updatedAt: number
  /** Schema version */
  v?: number
} & ({
  /** Playlist visibility: public (show in channel), unlisted (not in channel), private (encrypted) */
  type: "private"
  /** Reference to the encrypted data of the playlist (only for private playlists) */
  encryptedReference: string
} | {
  /** Playlist visibility: public (show in channel), unlisted (not in channel), private (encrypted) */
  type: "public" | "unlisted"
  /** List of the playlist videos */
  videos: SwarmPlaylistVideoRaw[]
  /** Playlist description */
  description?: string | null
})

export type EncryptedSwarmPlaylistData = {
  /** List of the playlist videos */
  videos: SwarmPlaylistVideoRaw[]
  /** Playlist description */
  description?: string | null
}

export type SwarmPlaylistVideoRaw = {
  /** Video reference */
  r: string
  /** Video Title */
  t: string
  /** Timestamp of when the videos has been added to playlist */
  a: number
  /** Timestamp of when the video should be visible */
  p?: number
}

export type SwarmPlaylist = {
  /** Playlist id (used for feed update) */
  id: string
  /** Playlist reference */
  reference: string | null
  /** Playlist name */
  name: string
  /** Playlist owner */
  owner: string
  /** Playlist creation timestamp */
  createdAt: number
  /** Playlist update timestamp */
  updatedAt: number

  /** Playlist visibility: public (show in channel), unlisted (not in channel), private (encrypted) */
  type: SwarmPlaylistType
  /** Reference to the encrypted data of the playlist (only for private playlists) */
  encryptedReference?: string
  /** Password used to decrypt the data */
  encryptionPassword?: string
  /** Ecrypted data fetched from `encryptedReference` */
  encryptedData?: string
  /** List of the playlist videos */
  videos?: SwarmPlaylistVideo[]
  /** Playlist description */
  description?: string
}

export type SwarmPlaylistVideo = {
  /** Video reference */
  reference: string
  /** Video Title */
  title: string
  /** Timestamp of when the videos has been added to playlist */
  addedAt: number
  /** Timestamp of when the video should be visible */
  publishedAt?: number
}

export type SwarmPlaylistType = "public" | "unlisted" | "private"
