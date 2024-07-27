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

import React from "react"
import { blurHashToDataURL } from "@etherna/sdk-js/utils"

import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid"

import Image from "@/components/common/Image"
import { Dropdown } from "@/components/ui/actions"
import { Skeleton } from "@/components/ui/display"
import { usePlaylistPreviewQuery } from "@/queries/playlist-preview-query"
import { usePlaylistQuery } from "@/queries/playlist-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"

import type { Playlist } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"

type PlaylistsListItemProps = {
  rootManifest: Reference
  onEdit?: (playlist: Playlist) => void
  onRemove?: (playlist: Playlist) => void
}

const PlaylistsListItem: React.FC<PlaylistsListItemProps> = ({
  rootManifest,
  onEdit,
  onRemove,
}) => {
  const owner = useUserStore(state => state.address ?? "0x0")
  const beeClient = useClientsStore(state => state.beeClient)
  const playlistQuery = usePlaylistQuery({ owner, playlistIdentification: { rootManifest } })

  return (
    <div className="flex gap-2">
      <div className="relative my-auto hidden aspect-video h-12 shrink-0 overflow-hidden rounded-md bg-gray-300 dark:bg-gray-700 md:block xl:h-14">
        {playlistQuery.isLoading ? (
          <Skeleton className="absolute inset-0" />
        ) : (
          <Image
            className="absolute inset-0"
            src={
              playlistQuery.data?.preview.thumb?.path
                ? beeClient.bzz.url("", playlistQuery.data.preview?.thumb.path)
                : ""
            }
            placeholder="blur"
            blurredDataURL={
              playlistQuery.data?.preview.thumb?.blurhash
                ? blurHashToDataURL(playlistQuery.data.preview?.thumb.blurhash)
                : undefined
            }
          />
        )}
        {!playlistQuery.isLoading && !playlistQuery.data?.preview.thumb && (
          <ExclamationCircleIcon className="opacity-50 absolute-center" width={16} />
        )}
      </div>
      <div className="flex-1">
        {playlistQuery.isLoading ? (
          <Skeleton className="block h-4 w-full" />
        ) : (
          <h2 className="text-md/tight font-semibold">{playlistQuery.data?.preview.name}</h2>
        )}

        <div className="mt-1">
          {playlistQuery.isLoading ? (
            <Skeleton className="block h-3 w-1/2" />
          ) : (
            <p className="text-sm/tight text-gray-600 dark:text-gray-400">
              {playlistQuery.data?.details.videos.length} videos
            </p>
          )}
        </div>
      </div>
      <div className="my-auto shrink-0">
        {playlistQuery.isSuccess && (
          <Dropdown>
            <Dropdown.Toggle>
              <EllipsisVerticalIcon width={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                action={() => {
                  onEdit?.(playlistQuery.data)
                }}
              >
                Edit
              </Dropdown.Item>
              <Dropdown.Item
                action={() => {
                  onRemove?.(playlistQuery.data)
                }}
              >
                Remove
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </div>
  )
}

export default PlaylistsListItem
