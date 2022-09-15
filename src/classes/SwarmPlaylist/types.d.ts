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
import type { SwarmPlaylist, SwarmPlaylistType } from "@/definitions/swarm-playlist"

export type SwarmPlaylistReaderOptions = {
  beeClient: BeeClient
  owner?: EthAddress
  id?: string | "__channel" | "__saved"
}

export type SwarmPlaylistWriterOptions = {
  beeClient: BeeClient
}
