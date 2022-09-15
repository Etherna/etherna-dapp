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

import type { Canceler } from "axios"

import type BeeClient from "@/classes/BeeClient"
import type { SwarmPlaylist } from "@/definitions/swarm-playlist"

export type SwarmUserPlaylistsReaderOptions = {
  beeClient: BeeClient
}

export type SwarmUserPlaylistsDownloadOptions = {
  /** Whether to download the channel playlist */
  resolveChannel?: boolean
  /** Whether to download the saved videos playlist */
  resolveSaved?: boolean
  /** Whether to download all the custom playlists */
  resolveCustom?: boolean
}

export type SwarmUserPlaylistsWriterOptions = {
  beeClient: BeeClient
}
