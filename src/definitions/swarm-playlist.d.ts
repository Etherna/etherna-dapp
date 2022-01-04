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
}

export type SwarmPlaylistRaw = {
  /** Playlist id (used for feed update) */
  id: string
  /** Playlist name (undefined for __channel & __saved) */
  name: string | undefined
  /** Playlist owner */
  owner: string
  /** Playlist creation timestamp */
  created_at: number
  /** Playlist update timestamp */
  updated_at: number
} & ({
  /** Playlist visibility: public (show in channel), unlisted (not in channel), private (encrypted) */
  type: "private"
  /** Reference to the encrypted data of the playlist (only for private playlists) */
  encryptedReference: string
} | {
  /** Playlist visibility: public (show in channel), unlisted (not in channel), private (encrypted) */
  type: "public" | "unlisted"
  /** Reference list of the playlist videos */
  videos: string[]
  /** Playlist description */
  description?: string | null
})

export type EncryptedSwarmPlaylistData = {
  /** Reference list of the playlist videos */
  videos: string[]
  /** Playlist description */
  description?: string | null
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
  created_at: number
  /** Playlist update timestamp */
  updated_at: number

  /** Playlist visibility: public (show in channel), unlisted (not in channel), private (encrypted) */
  type: SwarmPlaylistType
  /** Reference to the encrypted data of the playlist (only for private playlists) */
  encryptedReference?: string
  /** Password used to decrypt the data */
  encryptionPassword?: string
  /** Ecrypted data fetched from `encryptedReference` */
  encryptedData?: string
  /** Reference list of the playlist videos */
  videos?: string[]
  /** Playlist description */
  description?: string
}

export type SwarmPlaylistType = "public" | "unlisted" | "private"
