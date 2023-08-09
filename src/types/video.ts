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
 *
 */

import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import type { Profile, Video, VideoPreview } from "@etherna/sdk-js"

export type WithOwner<V extends Video | VideoPreview> = V & { owner: Profile | undefined }

export type WithOffersStatus<V extends Video | VideoPreview> = V & {
  offers: VideoOffersStatus | undefined
}

export type WithIndexes<V extends Video | VideoPreview> = V & { indexesStatus: IndexesStatus }

export type VideoWithIndexes = WithIndexes<Video>

export type VideoWithOwner = WithOwner<Video>

export type VideoWithAll = WithIndexes<WithOffersStatus<WithOwner<Video>>>

export type IndexesStatus = {
  [url: string]:
    | {
        indexReference: string
        totUpvotes: number
        totDownvotes: number
      }
    | undefined
}
