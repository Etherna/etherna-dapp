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

import { BeeClient } from "@etherna/sdk-js/clients"
import { VideoDeserializer } from "@etherna/sdk-js/serializers"
import { urlOrigin } from "@etherna/sdk-js/utils"

import SwarmProfile from "@/classes/SwarmProfile"
import SwarmVideo from "@/classes/SwarmVideo"
import clientsStore from "@/stores/clients"
import { nullablePromise } from "@/utils/promise"

import type { VideoWithIndexes } from "@/types/video"
import type { Profile } from "@etherna/sdk-js"
import type { EthAddress, IndexVideo, Reference } from "@etherna/sdk-js/clients"

const match = /\/watch\/([^/]+)/

const fetch = async () => {
  const { beeClient, indexClient } = clientsStore.getState()

  const matches = window.location.pathname.match(match)
  if (matches && matches.length >= 2) {
    const reference = matches[1]!

    try {
      const isSwarmReference = BeeClient.isValidHash(reference)
      const videoReader = new SwarmVideo.Reader(reference, {
        beeClient,
        indexClient,
      })

      let [video, indexVideo] = await Promise.all([
        videoReader.download({ mode: "full" }) as Promise<VideoWithIndexes>,
        isSwarmReference
          ? nullablePromise(indexClient.videos.fetchVideoFromHash(reference))
          : Promise.resolve(null),
      ])

      if (!video && indexVideo?.lastValidManifest?.sources.length) {
        const deserializer = new VideoDeserializer(beeClient.url)
        const rawVideo = JSON.stringify({
          ownerAddress: indexVideo.ownerAddress,
          title: indexVideo.lastValidManifest.title,
          description: indexVideo.lastValidManifest.description,
          thumbnail: indexVideo.lastValidManifest.thumbnail,
          batchId: indexVideo.lastValidManifest.batchId ?? null,
          duration: indexVideo.lastValidManifest.duration,
          sources: indexVideo.lastValidManifest.sources,
          createdAt: new Date(indexVideo.creationDateTime).getTime(),
          updatedAt: indexVideo.lastValidManifest.updatedAt ?? null,
        })
        const preview = deserializer.deserializePreview(rawVideo, {
          reference: indexVideo.lastValidManifest.hash,
        })
        const details = deserializer.deserializeDetails(rawVideo, {
          reference: indexVideo.lastValidManifest.hash,
        })
        video = {
          reference: indexVideo.lastValidManifest.hash as Reference,
          preview,
          details,
          indexesStatus: {},
        }
      }

      if (!video) {
        throw new Error("Video not found")
      }

      video.indexesStatus = {}

      indexVideo =
        indexVideo ??
        ("lastValidManifest" in (videoReader.rawResponse ?? {})
          ? (videoReader.rawResponse as IndexVideo)
          : null)

      if (video && indexVideo) {
        video.indexesStatus[urlOrigin(indexClient.url)!] = {
          indexReference: indexVideo.id,
          totDownvotes: indexVideo.totDownvotes,
          totUpvotes: indexVideo.totUpvotes,
        }
      }

      const owner = video!.preview.ownerAddress as EthAddress
      const profileReader = new SwarmProfile.Reader(owner, { beeClient })
      const profile = await profileReader.download()

      // set prefetch data
      window.prefetchData = {}
      window.prefetchData.ownerProfile = profile
      window.prefetchData.video = video
    } catch (error: any) {
      console.error(error)
      window.prefetchData = {}
      window.prefetchData.ownerProfile = null
      window.prefetchData.video = null
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
