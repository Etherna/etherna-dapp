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

import { EmptyReference } from "@etherna/sdk-js/utils"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmProfile from "@/classes/SwarmProfile"
import SwarmVideo from "@/classes/SwarmVideo"
import clientsStore from "@/stores/clients"
import { fullfilledPromisesResult } from "@/utils/promise"

import type { Profile, ProfileWithEns, Video } from "@etherna/sdk-js"
import type { EthAddress } from "@etherna/sdk-js/clients"

const match = /\/profile\/([^/]+)/

const fetch = async () => {
  const { beeClient, indexClient } = clientsStore.getState()

  const matches = window.location.pathname.match(match)
  if (matches && matches.length >= 2) {
    const address = matches[1] as EthAddress

    // Fetch channel playlist & profile
    const playlistReader = new SwarmPlaylist.Reader(
      { id: SwarmPlaylist.Reader.channelPlaylistId, owner: address },
      {
        beeClient,
      }
    )
    const profileReader = new SwarmProfile.Reader(address, { beeClient })

    const [profileResult, channelResult] = await Promise.allSettled([
      profileReader.download({
        mode: "full",
      }),
      playlistReader.download({ mode: "full" }),
    ])
    const profile =
      profileResult.status === "fulfilled"
        ? profileResult.value
        : ({
            reference: EmptyReference,
            ens: null,
            preview: {
              name: "",
              avatar: null,
              batchId: null,
            },
            details: {
              cover: null,
              description: null,
            },
          } as ProfileWithEns)

    // Fetch channel playlists videos
    const playlistVideos =
      channelResult.status === "fulfilled" ? channelResult.value.details.videos : []
    const references = playlistVideos?.slice(0, 10) ?? []
    const videosPromises = await Promise.allSettled(
      references.map(video => {
        const reader = new SwarmVideo.Reader(video.reference, {
          beeClient,
          indexClient,
        })
        return reader.download({ mode: "preview" })
      })
    )

    const videos = fullfilledPromisesResult(videosPromises).filter(Boolean) as Video[]

    // set prefetch data
    window.prefetchData = {}
    window.prefetchData.profile = profile
    window.prefetchData.videos = videos
  }
}

const profilePrefetcher = {
  match,
  fetch,
}

export type ProfilePrefetch = {
  profile?: ProfileWithEns | null
  videos?: Video[] | null
}

export default profilePrefetcher
