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

import { IndexEncryptionType } from "@classes/EthernaIndexClient/types"
import SwarmImage from "@classes/SwarmImage"
import { SwarmImageRaw } from "@classes/SwarmImage/types"
import { Profile } from "@classes/SwarmProfile/types"
import { Canceler } from "axios"

export type SwarmVideoRaw = {
  /**  Title of the video */
  title: string
  /**  Description of the video */
  description: string
  /**  Quality of the original video */
  originalQuality: string
  /**  Address of the owner of the video */
  ownerAddress: string
  /**  Duration of the video in seconds */
  duration: number
  /** Thumbnail raw image */
  thumbnail?: SwarmImageRaw
  /**  List of available qualities of the video */
  sources: SwarmVideoSourceRaw[]
}

export type SwarmVideoMeta = {
  /**  Hash of the video */
  hash: string
  /**  Title of the video */
  title?: string
  /**  Description of the video */
  description?: string
  /**  Quality of the original video */
  originalQuality?: string
  /**  Address of the owner of the video */
  ownerAddress?: string
  /**  Duration of the video in seconds */
  duration: number
  /**  Url of the original video */
  source: string
  /**  Thumbnail image data */
  thumbnail?: SwarmImage
  /**  All qualities of video */
  sources: VideoSource[]
}

export type Video = SwarmVideoMeta & {
  /** Whether the video is indexed */
  isVideoOnIndex: boolean
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

  /** Owner info */
  owner?: SwarmVideoOwner
}

export type SwarmVideoOwner = {
  /** Owner ETH address */
  ownerAddress?: string
  /** Owner manifest hash of the profile */
  ownerIdentityManifest?: string
  /** Profile data of the owner */
  profileData?: Profile
}

export type SwarmVideoSourceRaw = {
  quality: string
  reference: string
  referenceProtocol: "bytes" | "bzz"
  size?: number
  bitrate?: number
  contentType?: string
}

export type VideoSource = SwarmVideoSourceRaw & {
  /**  Source url */
  source: string
}


// Class options

export type SwarmVideoDownloadOptions = {
  /** If true will download the video even with prefetched data (default = false) */
  forced?: boolean
  /** By default true, set to false to avoid fetchsing the profile */
  fetchProfile?: boolean
}

export type SwarmVideoUploadOptions = {
  onUploadProgress?: (progress: number) => void
  onCancelToken?: (canceler: Canceler) => void
}
