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

import React, { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PlaylistBuilder } from "@etherna/sdk-js/swarm"
import { dateToTimestamp } from "@etherna/sdk-js/utils"
import { Portal } from "@headlessui/react"
import { useQueryClient } from "@tanstack/react-query"
import { i } from "vite/dist/node/types.d-aGj9QkWt"

import { ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid"

import PlaylistShareButton from "./PlaylistShareButton"
import PlaylistViewVideos from "./PlaylistViewVideos"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmUserPlaylists from "@/classes/SwarmUserPlaylists"
import PlaylistEditModal from "@/components/modals/PlaylistEditModal"
import { Button, Dropdown } from "@/components/ui/actions"
import { Alert, Avatar, Skeleton } from "@/components/ui/display"
import useConfirmation from "@/hooks/useConfirmation"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useErrorMessage from "@/hooks/useErrorMessage"
import { usePlaylistRootManifest } from "@/hooks/usePlaylistRootManifest"
import { usePlaylistQuery } from "@/queries/playlist-query"
import { useProfilePreviewQuery } from "@/queries/profile-preview-query"
import { useUserPlaylistsQuery } from "@/queries/user-playlists-query"
import routes from "@/routes"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"
import { shortenEthAddr } from "@/utils/ethereum"

import type { Playlist } from "@etherna/sdk-js"
import type { PlaylistIdentification } from "@etherna/sdk-js/swarm"

type PlaylistViewProps = {
  identification: PlaylistIdentification
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ identification }) => {
  const navigate = useNavigate()
  const address = useUserStore(state => state.address ?? "0x0")
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const beeClient = useClientsStore(state => state.beeClient)
  const { fetchDefaultBatchIdOrCreate } = useDefaultBatch({
    autofetch: !defaultBatchId,
    saveAfterCreate: false,
  })

  const isReservedPlaylist =
    "id" in identification &&
    [SwarmPlaylist.Reader.channelPlaylistId, SwarmPlaylist.Reader.savedPlaylistId].includes(
      identification.id
    )
  const playlistQuery = usePlaylistQuery({
    playlistIdentification: identification,
    fillEmptyState: isReservedPlaylist,
  })
  const userPlaylistsQuery = useUserPlaylistsQuery({ owner: address })
  const profilePreviewQuery = useProfilePreviewQuery({ address: playlistQuery.data?.preview.owner })

  const { rootManifest } = usePlaylistRootManifest({ identification })
  const [showEditModal, setShowEditModal] = useState(false)
  const { showError } = useErrorMessage()
  const { waitConfirmation } = useConfirmation()
  const queryClient = useQueryClient()

  const playlistUserLibraryStatus = useMemo(() => {
    if (rootManifest === undefined) return "loading"
    if (playlistQuery.isLoading) return "loading"
    if (userPlaylistsQuery.isLoading) return "loading"

    if (userPlaylistsQuery.isSuccess && rootManifest) {
      if (userPlaylistsQuery.data?.includes(rootManifest)) {
        return "included"
      } else {
        return "not-included"
      }
    }

    return "error"
  }, [playlistQuery, rootManifest, userPlaylistsQuery])

  const updatePlaylist = (playlist: Playlist) => {
    queryClient.setQueryData(usePlaylistQuery.getQueryKey(identification), () => playlist)
    playlistQuery.refetch()

    setShowEditModal(false)
  }

  const addToLibrary = async (mode: "add" | "copy") => {
    if (!playlistQuery.data) {
      showError("Playlist is loading. Try again in a few seconds.")
      return
    }
    if (playlistQuery.isLoading) {
      showError("Library is loading. Try again in a few seconds.")
      return
    }
    if (!rootManifest) {
      showError("Coudn't load playlist identifier. Try again after refreshing the page.")
      return
    }

    const batchId = await fetchDefaultBatchIdOrCreate()

    if (!batchId) {
      showError("Default postage batch not loaded or not created yet")
      return
    }

    const currentLib = userPlaylistsQuery.data ?? []

    let savingRootManifest = rootManifest

    if (mode === "copy") {
      const playlistBuilder = new PlaylistBuilder()
      playlistBuilder.previewMeta = {
        id: crypto.randomUUID(),
        name: playlistQuery.data.preview.name,
        type: playlistQuery.data.preview.type,
        owner: address,
        thumb: playlistQuery.data.preview.thumb,
        passwordHint: playlistQuery.data.preview.passwordHint,
        createdAt: dateToTimestamp(new Date()),
        updatedAt: dateToTimestamp(new Date()),
      }
      playlistBuilder.detailsMeta = {
        name: playlistQuery.data.details.name,
        description: playlistQuery.data.details.description,
        videos: playlistQuery.data.details.videos.map(vid => ({
          r: vid.reference,
          t: vid.title,
          a: dateToTimestamp(vid.addedAt),
          p: vid.publishedAt ? dateToTimestamp(vid.publishedAt) : undefined,
        })),
      }
      playlistBuilder.updateNode()

      const playlistWriter = new SwarmPlaylist.Writer(playlistBuilder, {
        beeClient,
      })

      const playlist = await playlistWriter.upload({
        batchId,
      })

      savingRootManifest = playlist.preview.rootManifest
    }

    currentLib.push(savingRootManifest)

    const writer = new SwarmUserPlaylists.Writer(currentLib, {
      beeClient,
    })

    await writer.upload({
      batchId,
    })

    queryClient.setQueryData(useUserPlaylistsQuery.getQueryKey(address), (data: string[]) => [
      ...data,
      rootManifest,
    ])
    await userPlaylistsQuery.refetch()

    if (mode === "copy") {
      navigate(routes.playlist(savingRootManifest))
    }
  }

  const removeFromLibrary = async () => {
    const proceed = await waitConfirmation(
      "Remove playlist",
      "Are you sure you want to remove this playlist from your library?",
      "Remove",
      "destructive"
    )

    if (!proceed) return

    if (playlistQuery.isLoading) {
      showError("Library is loading. Try again in a few seconds.")
      return
    }
    if (!rootManifest) {
      showError("Coudn't load playlist identifier. Try again after refreshing the page.")
      return
    }

    const currentLib = userPlaylistsQuery.data ?? []
    const newLib = currentLib.filter(item => item !== rootManifest)

    const writer = new SwarmUserPlaylists.Writer(newLib, {
      beeClient,
    })

    await writer.upload({
      batchId: defaultBatchId,
    })

    queryClient.setQueryData(useUserPlaylistsQuery.getQueryKey(address), newLib)
    userPlaylistsQuery.refetch()
  }

  const isPlaylistOwner = playlistQuery.data?.preview.owner === address

  return (
    <div className="flex w-full flex-col gap-8 lg:min-h-72 lg:flex-row">
      <aside className="shrink-0 rounded-lg bg-gray-100 p-4 dark:bg-gray-800 lg:w-1/3 lg:max-w-80">
        <div className="flex w-full flex-col items-center gap-4 lg:h-full">
          <div className="w-full">
            {playlistQuery.isLoading ? (
              <Skeleton className="block h-5 w-full" />
            ) : (
              <div className="flex items-start justify-between gap-2">
                {playlistQuery.isError ? (
                  <Alert
                    className="w-full"
                    color="error"
                    title="Cannot load playlist"
                    icon={<ExclamationCircleIcon />}
                  >
                    Make sure the playlist exists and that you have enough credits to load it.
                  </Alert>
                ) : (
                  <h1 className="text-md/tight font-semibold md:text-lg/tight">
                    {(() => {
                      if (isReservedPlaylist) {
                        switch (identification.id) {
                          case SwarmPlaylist.Reader.channelPlaylistId:
                            return "Channel playlist"
                          case SwarmPlaylist.Reader.savedPlaylistId:
                            return "Saved videos"
                        }
                      }
                      return playlistQuery.data?.preview.name || "Unnamed playlist"
                    })()}
                  </h1>
                )}
                {rootManifest && playlistQuery.isSuccess && !isReservedPlaylist && (
                  <PlaylistShareButton rootManifest={rootManifest} />
                )}
              </div>
            )}
          </div>

          <div className="flex w-full lg:flex-1 lg:flex-col">
            <div className="flex w-full flex-1 flex-col">
              <div className="">
                {playlistQuery.isLoading ? (
                  <Skeleton className="block h-4 w-full" />
                ) : (
                  <p className="text-sm/tight text-gray-600 dark:text-gray-400">
                    {playlistQuery.data?.preview.type || "public"}
                  </p>
                )}
              </div>

              {(!isReservedPlaylist ||
                ("owner" in identification && identification.owner !== address)) && (
                <div className="mt-3 md:mt-6">
                  <Link to={routes.channel(playlistQuery.data?.preview.owner ?? "0x0")}>
                    <div className="flex items-center space-x-2">
                      <div className="size-6">
                        {profilePreviewQuery.isLoading ? (
                          <Skeleton className="block size-6" roundedFull />
                        ) : (
                          <Avatar
                            size={24}
                            image={profilePreviewQuery.data?.avatar}
                            address={playlistQuery.data?.preview.owner}
                          />
                        )}
                      </div>
                      {profilePreviewQuery.isLoading ? (
                        <Skeleton className="block h-4 w-20" />
                      ) : (
                        <h5
                          className={cn(
                            "max-w-full flex-grow overflow-hidden text-ellipsis text-sm font-semibold",
                            "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300",
                            "transition-colors duration-200"
                          )}
                        >
                          {profilePreviewQuery.data?.name ??
                            shortenEthAddr(playlistQuery.data?.preview.owner)}
                        </h5>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              <div className="mt-4 lg:my-8">
                {playlistQuery.isLoading ? (
                  <Skeleton className="block h-4 w-full" />
                ) : (
                  <p className="text-sm/tight text-gray-700 dark:text-gray-300 md:text-base/tight">
                    {(() => {
                      if (isReservedPlaylist) {
                        switch (identification.id) {
                          case SwarmPlaylist.Reader.channelPlaylistId:
                            return "All the videos from the channel"
                          case SwarmPlaylist.Reader.savedPlaylistId:
                            return "All the videos that you saved to watch later"
                        }
                      }
                      return playlistQuery.data?.details.description || ""
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto shrink-0 lg:w-full">
              {(() => {
                if (isReservedPlaylist) {
                  if (identification.id === SwarmPlaylist.Reader.savedPlaylistId) {
                    return (
                      <Button className="lg:w-full" onClick={() => setShowEditModal(true)}>
                        Edit
                      </Button>
                    )
                  }

                  return null
                }

                switch (playlistUserLibraryStatus) {
                  case "loading":
                    return <Skeleton className="block h-10 w-full" />
                  case "included":
                    return (
                      <Dropdown className="lg:w-full">
                        <Dropdown.Toggle className="lg:w-full">
                          <Button className="lg:w-full" color="muted">
                            <span>{isPlaylistOwner ? "In library" : "Subscribed"}</span>
                            <ChevronDownIcon className="ml-2" width={16} />
                          </Button>
                        </Dropdown.Toggle>
                        <Portal>
                          <Dropdown.Menu>
                            {isPlaylistOwner && (
                              <>
                                <Dropdown.Item action={() => setShowEditModal(true)}>
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Separator />
                              </>
                            )}
                            <Dropdown.Item action={() => removeFromLibrary()}>
                              Remove from library
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Portal>
                      </Dropdown>
                    )
                  case "not-included":
                    return (
                      <Dropdown className="lg:w-full">
                        <Dropdown.Toggle className="lg:w-full">
                          <Button className="lg:w-full">
                            Add to library
                            <ChevronDownIcon className="ml-2" width={16} />
                          </Button>
                        </Dropdown.Toggle>
                        <Portal>
                          <Dropdown.Menu>
                            <Dropdown.Item action={() => addToLibrary("add")}>
                              Subscribe
                            </Dropdown.Item>
                            <Dropdown.Item action={() => addToLibrary("copy")}>Copy</Dropdown.Item>
                          </Dropdown.Menu>
                        </Portal>
                      </Dropdown>
                    )
                  case "error":
                    return <Alert color="error">Cannot retrieve library status</Alert>
                }
              })()}
            </div>
          </div>
        </div>
      </aside>

      {playlistQuery.isSuccess && <PlaylistViewVideos playlist={playlistQuery.data} />}

      {playlistQuery.data && (
        <PlaylistEditModal
          show={showEditModal}
          playlist={playlistQuery.data}
          onClose={() => setShowEditModal(false)}
          onSave={updatePlaylist}
        />
      )}
    </div>
  )
}

export default PlaylistView
