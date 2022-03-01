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

import SwarmResourcesReader from "./SwarmResourcesReader"
import SwarmResourcesWriter from "./SwarmResourcesWriter"
import type { Video } from "@definitions/swarm-video"

const SwarmResourcesIO = {
  Reader: SwarmResourcesReader,
  Writer: SwarmResourcesWriter,
  getVideoReferences(video: Video) {
    return [
      video.reference,
      ...video.sources.map(source => source.reference),
      ...Object.values(video.thumbnail?.sources ?? {}),
    ]
  },
  getVideoReferenceType(video: Video, reference: string): "metadata" | "video" | "thumb" | null {
    // is metadata?
    if (reference === video.reference) return "metadata"
    // is video source?
    const videoSource = video.sources.find(source => source.reference === reference)
    if (videoSource) return "video"
    // is thumb image source?
    const thumbSource = Object.entries(video.thumbnail?.sources ?? {})
      .find(([_, thumbReference]) => thumbReference === reference)
    if (thumbSource) return "thumb"
    // not found!
    return null
  },
  getVideoReferenceLabel(video: Video, reference: string) {
    const type = SwarmResourcesIO.getVideoReferenceType(video, reference)
    switch (type) {
      case "metadata": return "Video metadata"
      case "video": return `Source ${video.sources.find(source => source.reference === reference)!.quality}`
      case "thumb": return `Thumbnail ${Object.entries(video.thumbnail?.sources ?? {})
        .find(([_, thumbReference]) => thumbReference === reference)![0]}`
      default: return reference.slice(0, 8)
    }
  },
}

export default SwarmResourcesIO
