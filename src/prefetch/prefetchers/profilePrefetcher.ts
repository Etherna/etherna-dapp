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

import { store } from "@state/store"
import { nullablePromise } from "@utils/promise"
import SwarmProfileIO from "@classes/SwarmProfile"
import SwarmVideoIO from "@classes/SwarmVideo"
import type { Profile } from "@definitions/swarm-profile"
import type { Video } from "@definitions/swarm-video"

const match = /\/profile\/([^/]+)/

const fetch = async () => {
  const { beeClient, indexClient } = store.getState().env

  const matches = window.location.pathname.match(match)
  if (matches && matches.length >= 2) {
    const address = matches[1]

    const [user, userVideos] = await Promise.all([
      nullablePromise(indexClient.users.fetchUser(address)),
      nullablePromise(indexClient.users.fetchUserVideos(address, 0, 50))
    ])

    const swarmProfileReader = user
      ? new SwarmProfileIO.Reader(user.address, { beeClient })
      : null
    const profile = swarmProfileReader
      ? await nullablePromise(swarmProfileReader.download(true))
      : null

    const videos = userVideos
      ? await Promise.all(userVideos.map(video => (
        nullablePromise(new SwarmVideoIO.Reader(video.manifestHash, user?.address ?? "0x0", {
          beeClient,
          indexClient,
          profileData: profile ?? undefined,
          indexData: video,
        }).download(true))
      )))
      : null

    // set prefetch data
    window.prefetchData = {}
    window.prefetchData.profile = profile
    window.prefetchData.videos = videos ? videos.filter(Boolean) as Video[] : null
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
