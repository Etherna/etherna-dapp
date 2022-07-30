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

import SwarmUserPlaylistsReader from "./SwarmUserPlaylistsReader"
import SwarmUserPlaylistsWriter from "./SwarmUserPlaylistsWriter"
import uuidv4 from "@/utils/uuid"
import type { SwarmPlaylist } from "@/definitions/swarm-playlist"

const SwarmUserPlaylistsIO = {
  Reader: SwarmUserPlaylistsReader,
  Writer: SwarmUserPlaylistsWriter,
  lastVersion: 1,
  getFeedTopicName: () => `EthernaUserPlaylists`,
  getDefaultChannelPlaylist: (owner: string): SwarmPlaylist => ({
    id: "__channel",
    reference: null,
    name: "",
    owner,
    type: "public",
    videos: [],
    createdAt: +new Date(),
    updatedAt: +new Date(),
  }),
  getDefaultSavedPlaylist: (owner: string): SwarmPlaylist => ({
    id: "__saved",
    reference: null,
    name: "",
    owner,
    type: "unlisted",
    videos: [],
    createdAt: +new Date(),
    updatedAt: +new Date(),
  }),
  getDefaultCustomPlaylist: (owner: string): SwarmPlaylist => ({
    id: uuidv4(),
    reference: null,
    name: "Untitle",
    owner,
    type: "unlisted",
    videos: [],
    createdAt: +new Date(),
    updatedAt: +new Date(),
  })
}

export default SwarmUserPlaylistsIO
