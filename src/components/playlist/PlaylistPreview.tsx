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
import { Link } from "react-router-dom"
import { EmptyReference } from "@etherna/sdk-js/utils"

import { ExclamationCircleIcon } from "@heroicons/react/24/solid"

import Image from "@/components/common/Image"
import PlaylistPreviewPlaceholder from "@/components/placeholders/PlaylistPreviewPlaceholder"
import { Alert } from "@/components/ui/display"
import { usePlaylistRootManifest } from "@/hooks/usePlaylistRootManifest"
import { usePlaylistPreviewQuery } from "@/queries/playlist-preview-query"
import routes from "@/routes"

import type { EnsAddress, EthAddress, Reference } from "@etherna/sdk-js/clients"

type PlaylistPreviewProps = {
  owner: EthAddress | EnsAddress
  identification:
    | {
        rootManifest: Reference
      }
    | {
        id: string
        owner: EthAddress
      }
}

const PlaylistPreview: React.FC<PlaylistPreviewProps> = ({ identification, owner }) => {
  const playlistQuery = usePlaylistPreviewQuery({
    owner,
    playlistIdentification: identification,
  })

  const { rootManifest } = usePlaylistRootManifest({ identification })

  switch (playlistQuery.status) {
    case "success":
      return (
        <Link className="block" to={routes.playlist(rootManifest ?? EmptyReference)}>
          <div className="flex flex-col space-y-px">
            <div
              className="mx-4 h-1 rounded-none rounded-t bg-gray-200 object-top dark:bg-gray-700"
              style={{
                backgroundImage: playlistQuery.data.thumb
                  ? `url(${playlistQuery.data.thumb})`
                  : undefined,
              }}
            />
            <div
              className="mx-2 h-1.5 rounded-none rounded-t bg-gray-200 object-top dark:bg-gray-700"
              style={{
                backgroundImage: playlistQuery.data.thumb
                  ? `url(${playlistQuery.data.thumb})`
                  : undefined,
              }}
            />
            <Image
              className="rounded-md bg-gray-200 dark:bg-gray-700"
              src={playlistQuery.data.thumb?.path}
              placeholder="blur"
              blurredDataURL={playlistQuery.data.thumb?.blurhash}
              aspectRatio={16 / 9}
              layout="responsive"
            />
          </div>

          <h2 className="mt-1 text-base/tight font-semibold">{playlistQuery.data.name}</h2>
          <p className="text-xs text-gray-500">{playlistQuery.data.type}</p>
        </Link>
      )
    case "error":
      return (
        <Link to={routes.playlist(rootManifest ?? EmptyReference)}>
          <div
            className="relative mt-3 overflow-hidden"
            style={{
              paddingBottom: (9 / 16) * 100 + "%",
            }}
          >
            <Alert className="absolute inset-0 px-3 py-8" color="error">
              <div className="flex flex-col items-center">
                <ExclamationCircleIcon width={24} />
                <p className="text-center text-sm">{playlistQuery.error.message}</p>
              </div>
            </Alert>
          </div>
        </Link>
      )
    case "pending":
    default:
      return <PlaylistPreviewPlaceholder />
  }
}

export default PlaylistPreview
