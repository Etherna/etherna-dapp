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

import SwarmVideoIO from "@/classes/SwarmVideo"
import type { Video } from "@/definitions/swarm-video"
import { store } from "@/state/store"

const match = /\/watch/

const fetch = async () => {
  const { beeClient, indexClient } = store.getState().env

  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams && searchParams.has("v")) {
    const reference = searchParams.get("v")!

    try {
      const swarmVideoReader = new SwarmVideoIO.Reader(reference, undefined, {
        beeClient,
        indexClient,
        fetchProfile: true,
      })
      const video = await swarmVideoReader.download(true)

      // set prefetch data
      window.prefetchData = {}
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
  video?: Video
}

export default videoPrefetcher
