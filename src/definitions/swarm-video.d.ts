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

import { Canceler } from "axios"
import { IndexEncryptionType } from "@classes/EthernaIndexClient/types"
import { SwarmImageRaw } from "./swarm-image"

export type SwarmVideoRaw = {
  /**  Title of the video */
  title: string
  /**  Description of the video */
  description: string
  /**  Quality of the original video */
  originalQuality: `${number}p`
  /**  Address of the owner of the video */
  ownerAddress: string
  /**  Duration of the video in seconds */
  duration: number
  /** Thumbnail raw image */
  thumbnail: SwarmImageRaw | null
  /**  List of available qualities of the video */
  sources: SwarmVideoSourceRaw[]
}

export type SwarmVideoSourceRaw = {
  /** Video resolution (eg: 1080p) */
  quality: `${number}p`
  /** Swarm reference of the video */
  reference: string
  /** Video size in bytes */
  size: number
  /** Video bitrate */
  bitrate: number
}

export type SwarmVideo = {
  /**  Hash of the video */
  reference: string
  /**  Title of the video */
  title: string | null
  /**  Description of the video */
  description: string | null
  /**  Quality of the original video */
  originalQuality: `${number}p` | null
  /**  Address of the owner of the video */
  ownerAddress: string | null
  /**  Duration of the video in seconds */
  duration: number
  /**  Thumbnail image data */
  thumbnail: SwarmImage | null
  /**  All qualities of video */
  sources: VideoSource[]
}

export type VideoSource = SwarmVideoSourceRaw & {
  /**  Source url */
  source: string
}

export type VideoIndexed = {
  /** When the video was created */
  creationDateTime?: string
  /** Video encryption key */
  encryptionKey?: string
  /** Video encryption type */
  encryptionType?: IndexEncryptionType
  /** Number of down votes */
  totDownvotes?: number
  /** Number of up votes */
  totUpvotes?: number
}

export type Video = SwarmVideo & VideoIndexed & {
  /** Whether the video is indexed */
  isVideoOnIndex: boolean
  /** Owner info */
  owner?: Profile
}
