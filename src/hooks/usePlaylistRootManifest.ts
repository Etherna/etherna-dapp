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

import { useMemo, useState } from "react"
import { createPlaylistTopicName } from "@etherna/sdk-js/swarm"
import { fetchAddressFromEns, isEnsAddress } from "@etherna/sdk-js/utils"

import useEffectOnce from "./useEffectOnce"
import useClientsStore from "@/stores/clients"

import type { Reference } from "@etherna/sdk-js/clients"
import type { PlaylistIdentification } from "@etherna/sdk-js/swarm"

interface UsePlaylistRootManifestOptions {
  identification: PlaylistIdentification
}

export function usePlaylistRootManifest({ identification }: UsePlaylistRootManifestOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const [rootManifest, setRootManifest] = useState<Reference | null | undefined>()

  const rootManifestPromise = useMemo(() => {
    if ("rootManifest" in identification) {
      return Promise.resolve(identification.rootManifest)
    }

    const ownerPromise = isEnsAddress(identification.owner)
      ? fetchAddressFromEns(identification.owner).then(address => address ?? "0x0")
      : Promise.resolve(identification.owner)

    return ownerPromise.then(owner =>
      beeClient.feed
        .makeRootManifest(
          beeClient.feed.makeFeed(createPlaylistTopicName(identification.id), owner)
        )
        .then(feed => feed.reference)
    )
  }, [beeClient, identification])

  useEffectOnce(() => {
    setRootManifest(undefined)
    rootManifestPromise.then(setRootManifest).catch(err => {
      console.error(err)
      setRootManifest(null)
    })
  }, [rootManifestPromise])

  return {
    rootManifest,
  }
}
