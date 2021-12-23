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
import SwarmBeeClient from "@classes/SwarmBeeClient"
import uuidv4 from "@utils/uuid"
import type { SwarmVideoQuality, SwarmVideoRaw, Video } from "@definitions/swarm-video"

const SwarmVideoIO = {
  Reader: SwarmVideoReader,
  Writer: SwarmVideoWriter,
  getSourceName: (quality: string | number | null): SwarmVideoQuality => {
    return quality
      ? `${parseInt(`${quality}`)}p`
      : `${NaN}p`
  },
  getSourceQuality: (sourceName: string | null | undefined): number => {
    return parseInt(sourceName ?? "0")
  },
  getVideoFeedTopicName: (id: string) => `EthernaVideo:${id}`
}

export const getDefaultVideo = (reference: string, bee: SwarmBeeClient): Video => ({
  reference,
  id: uuidv4(),
  title: null,
  description: null,
  originalQuality: null,
  ownerAddress: null,
  duration: NaN,
  isVideoOnIndex: false,
  thumbnail: null,
  sources: [{
    reference,
    bitrate: NaN,
    size: NaN,
    source: bee.getBzzUrl(reference),
    quality: `${NaN}p`
  }],
})

export const getDefaultRawVideo = (reference: string): SwarmVideoRaw => ({
  id: uuidv4(),
  title: "",
  description: "",
  originalQuality: `${NaN}p`,
  ownerAddress: "0x0",
  duration: NaN,
  thumbnail: null,
  sources: [{
    reference,
    bitrate: NaN,
    size: NaN,
    quality: `${NaN}p`
  }],
})

export default SwarmVideoIO
