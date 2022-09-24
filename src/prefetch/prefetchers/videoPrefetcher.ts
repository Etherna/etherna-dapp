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

import type { Profile } from "@etherna/api-js"
import type { EthAddress, IndexVideo } from "@etherna/api-js/clients"
import { BeeClient } from "@etherna/api-js/clients"
import { urlOrigin } from "@etherna/api-js/utils"

import SwarmProfile from "@/classes/SwarmProfile"
import SwarmVideo from "@/classes/SwarmVideo"
import clientsStore from "@/stores/clients"
import type { VideoWithIndexes } from "@/types/video"
import { nullablePromise } from "@/utils/promise"

const match = /\/watch/

const fetch = async () => {
  const { beeClient, indexClient } = clientsStore.getState()

  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams && searchParams.has("v")) {
    const reference = searchParams.get("v")!

    try {
      const isSwarmReference = BeeClient.isValidHash(reference)
      const videoReader = new SwarmVideo.Reader(reference, {
        beeClient,
        indexClient,
      })

      let [video, indexVideo] = await Promise.all([
        videoReader.download() as Promise<VideoWithIndexes>,
        isSwarmReference
          ? nullablePromise(indexClient.videos.fetchVideoFromHash(reference))
          : Promise.resolve(null),
      ])
      video.indexesStatus = {}

      indexVideo =
        indexVideo ?? "lastValidManifest" in (videoReader.rawResponse ?? {})
          ? (videoReader.rawResponse as IndexVideo)
          : null

      if (indexVideo) {
        video.indexesStatus[urlOrigin(indexClient.url)!] = {
          indexReference: indexVideo.id,
          totDownvotes: indexVideo.totDownvotes,
          totUpvotes: indexVideo.totUpvotes,
        }
      }

      const owner = video!.ownerAddress as EthAddress
      const profileReader = new SwarmProfile.Reader(owner, { beeClient })
      const profile = await profileReader.download()

      // set prefetch data
      window.prefetchData = {}
      window.prefetchData.ownerProfile = profile
      window.prefetchData.video = video
    } catch (error: any) {
      console.error(error)
    }
  }
}

const videoPrefetcher = {
  match,
  fetch,
}

export type VideoPrefetch = {
  ownerProfile?: Profile | null
  video?: VideoWithIndexes | null
}

export default videoPrefetcher
