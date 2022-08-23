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

import SwarmVideoReader from "./SwarmVideoReader"
import SwarmVideoWriter from "./SwarmVideoWriter"
import SwarmBeeClient from "@/classes/SwarmBeeClient"
import type { SwarmVideoQuality, SwarmVideoRaw, Video } from "@/definitions/swarm-video"
import type { IndexVideo, IndexVideoManifest } from "@/definitions/api-index"
import type { SchemaVersion } from "@/definitions/schema"

const lastVersion: SchemaVersion = "1.0"

const SwarmVideoIO = {
  Reader: SwarmVideoReader,
  Writer: SwarmVideoWriter,
  lastVersion,
  isSwarmReference: (reference: string) => /^[A-Fa-f0-9]{64}$/.test(reference),
  getSourceName: (quality: string | number | null): SwarmVideoQuality => {
    return quality
      ? `${parseInt(`${quality}`)}p`
      : `${NaN}p`
  },
  getSourceQuality: (sourceName: string | null | undefined): number => {
    return parseInt(sourceName ?? "0")
  },
  getDefaultVideo(
    reference: string,
    indexData: IndexVideo | null | undefined,
    bee: SwarmBeeClient
  ): Video {
    return {
      reference: reference || indexData?.lastValidManifest?.hash || "",
      indexReference: indexData?.id,
      title: null,
      description: null,
      createdAt: indexData?.creationDateTime ? +new Date(indexData.creationDateTime) : +new Date(),
      originalQuality: null,
      ownerAddress: indexData?.ownerAddress ?? null,
      duration: NaN,
      isVideoOnIndex: !!indexData,
      isValidatedOnIndex: !!indexData?.lastValidManifest,
      thumbnail: null,
      sources: [{
        reference,
        bitrate: NaN,
        size: NaN,
        source: bee.getBzzUrl(reference),
        quality: `${NaN}p`
      }],
    }
  },
  getDefaultRawVideo(reference: string): SwarmVideoRaw {
    return {
      title: "",
      description: "",
      createdAt: +new Date(),
      originalQuality: `${NaN}p`,
      ownerAddress: "",
      duration: NaN,
      thumbnail: null,
      sources: [{
        reference,
        bitrate: NaN,
        size: NaN,
        quality: `${NaN}p`
      }],
    }
  },
  isValidatingManifest(manifest: IndexVideoManifest): boolean {
    return manifest.title === null &&
      manifest.description === null &&
      manifest.duration === null &&
      manifest.thumbnail === null &&
      manifest.originalQuality === null &&
      manifest.sources.length === 0
  },
}

export default SwarmVideoIO
