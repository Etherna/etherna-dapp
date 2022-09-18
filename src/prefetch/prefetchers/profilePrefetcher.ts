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

import type { EthAddress } from "@/classes/BeeClient/types"
import SwarmProfile from "@/classes/SwarmProfile"
import SwarmUserPlaylists from "@/classes/SwarmUserPlaylists"
import SwarmVideo from "@/classes/SwarmVideo"
import { store } from "@/state/store"
import type { Profile } from "@/types/swarm-profile"
import type { Video } from "@/types/swarm-video"
import { fullfilledPromisesResult } from "@/utils/promise"

const match = /\/profile\/([^/]+)/

const fetch = async () => {
  const { beeClient, indexClient } = store.getState().env

  const matches = window.location.pathname.match(match)
  if (matches && matches.length >= 2) {
    const address = matches[1] as EthAddress

    // Fetch user's playlists & profile
    const playlistsReader = new SwarmUserPlaylists.Reader(address, {
      beeClient,
    })
    const swarmProfileReader = new SwarmProfile.Reader(address, { beeClient })

    const [profilePromise] = await Promise.allSettled([
      swarmProfileReader.download(true),
      playlistsReader.download({ resolveChannel: true }),
    ])
    const profile =
      profilePromise.status === "fulfilled"
        ? profilePromise.value
        : {
            address,
            avatar: null,
            cover: null,
            description: null,
            name: null,
          }

    // Fetch channel playlists videos
    const references = playlistsReader.channelPlaylist?.videos?.slice(0, 50) ?? []
    const videosPromises = await Promise.allSettled(
      references.map(video => {
        const reader = new SwarmVideo.Reader(video.reference, address, {
          beeClient,
          indexClient,
          fetchProfile: false,
          profileData: profile,
        })
        return reader.download()
      })
    )

    const videos = fullfilledPromisesResult(videosPromises)

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
  profile?: Profile | null
  videos?: Video[] | null
}

export default profilePrefetcher
