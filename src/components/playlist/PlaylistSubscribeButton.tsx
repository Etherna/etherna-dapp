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

import React, { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import SwarmUserPlaylists from "@/classes/SwarmUserPlaylists"
import { Button } from "@/components/ui/actions"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useErrorMessage from "@/hooks/useErrorMessage"
import { useUserPlaylistsQuery } from "@/queries/user-playlists-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"

import type { Reference } from "@etherna/sdk-js/clients"

interface PlaylistSubscribeButtonProps extends React.ComponentProps<typeof Button> {
  rootManifest: Reference
}

const PlaylistSubscribeButton: React.FC<PlaylistSubscribeButtonProps> = ({
  children,
  rootManifest,
  color,
  ...props
}) => {
  const owner = useUserStore(state => state.address)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const beeClient = useClientsStore(state => state.beeClient)
  const { fetchBestUsableBatch } = useDefaultBatch({
    autofetch: !defaultBatchId,
    saveAfterCreate: false,
  })

  const { showError } = useErrorMessage()
  const [isPending, setIsPending] = useState(false)

  const queryClient = useQueryClient()
  const userPlaylistsQuery = useUserPlaylistsQuery({ owner })

  const isSubscribed = userPlaylistsQuery.data?.some(id => id === rootManifest)

  const fetchBatchId = async () => {
    let batchId = defaultBatchId

    if (!batchId) {
      const batch = await fetchBestUsableBatch()
      batchId = batch?.id
    }

    return batchId
  }

  const toggleSubscribe = async () => {
    setIsPending(true)

    try {
      const batchId = await fetchBatchId()

      if (!batchId) {
        showError("Default postage batch not loaded or not created yet")

        setIsPending(false)

        return
      }

      let currentLib = userPlaylistsQuery.data ?? []

      if (isSubscribed) {
        currentLib = currentLib.filter(id => id !== rootManifest)
      } else {
        currentLib.push(rootManifest)
      }

      const writer = new SwarmUserPlaylists.Writer(currentLib, {
        beeClient,
      })

      await writer.upload({
        batchId,
      })
    } catch (error) {
    } finally {
      setIsPending(false)
    }

    queryClient.setQueryData(useUserPlaylistsQuery.getQueryKey(owner!), (data: string[]) => [
      ...data,
      rootManifest,
    ])
    await userPlaylistsQuery.refetch()
  }

  return (
    <Button
      {...props}
      color={color ?? (isSubscribed ? "muted" : "inverted")}
      disabled={isPending || !owner}
      loading={isPending}
      onClick={toggleSubscribe}
    >
      {children ?? (isSubscribed ? "Unsubscribe" : "Subscribe")}
    </Button>
  )
}

export default PlaylistSubscribeButton
