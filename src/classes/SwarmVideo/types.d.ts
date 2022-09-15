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
import type EthernaGatewayClient from "@/classes/EthernaGatewayClient"
import type EthernaIndexClient from "@/classes/EthernaIndexClient"
import type { IndexVideo } from "@/definitions/api-index"
import type { GatewayType } from "@/definitions/extension-host"
import type { Profile } from "@/definitions/swarm-profile"
import type { SwarmVideoRaw, Video } from "@/definitions/swarm-video"

export type SwarmVideoReaderOptions = {
  beeClient: BeeClient
  indexClient?: EthernaIndexClient
  videoData?: Video | SwarmVideoRaw
  indexData?: IndexVideo | null
  profileData?: Profile
  fetchProfile?: boolean
  fetchFromCache?: boolean
  updateCache?: boolean
}

export type SwarmVideoWriterOptions = {
  beeClient: BeeClient
  gatewayClient: EthernaGatewayClient
  gatewayType: GatewayType
}

export type SwarmVideoUploadOptions = {
  onUploadProgress?: (progress: number) => void
  signal?: AbortSignal
}
