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

import React, { useEffect, useRef, useState } from "react"
import { useAuth } from "react-oidc-context"
import { PlaylistBuilder } from "@etherna/sdk-js/swarm"
import { useQueryClient } from "@tanstack/react-query"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import UnauthenticatedPlaceholder from "@/components/placeholders/UnauthenticatedPlaceholder"
import { Button, Modal } from "@/components/ui/actions"
import { Label, Skeleton } from "@/components/ui/display"
import { Checkbox } from "@/components/ui/inputs"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useErrorMessage from "@/hooks/useErrorMessage"
import { usePlaylistQuery } from "@/queries/playlist-query"
import { useUserPlaylistsQuery } from "@/queries/user-playlists-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"

import type { Playlist, Video } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"

interface SaveToModalProps {
  show: boolean
  video: Video
  onClose(): void
}

const SaveToModal: React.FC<SaveToModalProps> = ({ show, video, onClose }: SaveToModalProps) => {
  const { isLoading } = useAuth()
  const owner = useUserStore(state => state.address)
  const beeClient = useClientsStore(state => state.beeClient)
  const playlistsQuery = useUserPlaylistsQuery({ owner })
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const initialVideoPlaylists = useRef<Reference[]>([])
  const [selectedPlaylists, setSelectedPlaylists] = useState<Reference[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const { fetchBestUsableBatch } = useDefaultBatch({
    autofetch: !defaultBatchId,
    saveAfterCreate: false,
  })
  const { showError } = useErrorMessage()
  const queryClient = useQueryClient()

  const save = async () => {
    setIsSaving(true)

    let batchId = defaultBatchId

    if (!batchId) {
      const batch = await fetchBestUsableBatch()
      batchId = batch?.id
    }

    if (!batchId) {
      showError("Default postage batch not loaded or not created yet")
      return
    }

    try {
      const playlistsToUpdate = Array.from(
        new Set([...initialVideoPlaylists.current, ...selectedPlaylists])
      )

      await Promise.all(
        playlistsToUpdate.map(async rootManifest => {
          const fetchedPlaylist = queryClient.getQueryData(
            usePlaylistQuery.getQueryKey({ rootManifest })
          ) as Playlist | undefined

          if (!fetchedPlaylist) {
            throw new Error("Playlist not found: " + rootManifest)
          }

          const builder = new PlaylistBuilder()
          builder.initialize(
            fetchedPlaylist.reference,
            fetchedPlaylist.preview.owner,
            fetchedPlaylist.preview,
            fetchedPlaylist.details
          )

          await builder.loadNode({
            beeClient,
          })

          if (selectedPlaylists.includes(rootManifest)) {
            builder.addVideos([video])
          } else {
            builder.removeVideos([video.reference])
          }

          const writer = new SwarmPlaylist.Writer(builder, { beeClient })
          await writer.upload({ batchId })

          queryClient.invalidateQueries({
            exact: true,
            queryKey: usePlaylistQuery.getQueryKey({ rootManifest }),
          })
        })
      )

      onClose()
    } catch (error) {
      console.error(error)
      showError("Failed to update some playlists")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      show={show}
      showCancelButton={false}
      title="Save to..."
      footerButtons={
        <Button className="sm:ml-auto" loading={isSaving} onClick={save}>
          Save
        </Button>
      }
      onClose={onClose}
      large
      showCloseButton
    >
      {!owner && !isLoading && <UnauthenticatedPlaceholder />}

      <div className="flex flex-col space-y-1">
        {playlistsQuery.isLoading && (
          <>
            <PlaylistItemPlaceholder />
            <PlaylistItemPlaceholder />
            <PlaylistItemPlaceholder />
            <PlaylistItemPlaceholder />
          </>
        )}
        {playlistsQuery.isSuccess &&
          playlistsQuery.data.map(rootManifest => (
            <PlaylistItem
              key={rootManifest}
              rootManifest={rootManifest}
              videoReference={video.reference}
              selected={selectedPlaylists.includes(rootManifest)}
              onPlaylistLoaded={playlist => {
                if (playlist.details.videos.some(video => video.reference === video.reference)) {
                  initialVideoPlaylists.current.push(rootManifest)
                }
              }}
              onSelectedChange={selected => {
                setSelectedPlaylists(
                  selected
                    ? [...selectedPlaylists, rootManifest]
                    : selectedPlaylists.filter(p => p !== rootManifest)
                )
              }}
            />
          ))}
      </div>
    </Modal>
  )
}

const PlaylistItemPlaceholder = () => (
  <div className="space-y-1">
    <Skeleton className="block w-full" />
    <Skeleton className="block w-14" />
  </div>
)

const PlaylistItem: React.FC<{
  rootManifest: Reference
  videoReference: Reference
  selected: boolean
  onPlaylistLoaded: (playlist: Playlist) => void
  onSelectedChange: (selected: boolean) => void
}> = ({ rootManifest, videoReference, selected, onPlaylistLoaded, onSelectedChange }) => {
  const playlistQuery = usePlaylistQuery({
    playlistIdentification: { rootManifest },
  })

  useEffect(() => {
    if (playlistQuery.isSuccess) {
      onPlaylistLoaded(playlistQuery.data)

      const inPlaylist = playlistQuery.data.details.videos.some(
        video => video.reference === videoReference
      )

      if (inPlaylist) {
        onSelectedChange(true)
      } else {
        onSelectedChange(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistQuery.data, videoReference])

  if (playlistQuery.isLoading) {
    return <PlaylistItemPlaceholder />
  }

  const id = `playlist-${rootManifest}`

  return (
    <div
      className={cn("flex items-center space-x-3", {
        "rounded bg-red-500/10 p-2 text-red-500": playlistQuery.isError,
      })}
    >
      {playlistQuery.isSuccess && (
        <Checkbox id={id} checked={selected} onChange={onSelectedChange} />
      )}
      <div>
        {playlistQuery.isSuccess ? (
          <Label className="mb-0 text-gray-900 dark:text-gray-100" htmlFor={id}>
            {playlistQuery.data.preview.name}
          </Label>
        ) : (
          <p>Loading error</p>
        )}
        {playlistQuery.isSuccess && (
          <p className="text-xs text-gray-500">{playlistQuery.data.preview.type}</p>
        )}
      </div>
    </div>
  )
}

export default SaveToModal
