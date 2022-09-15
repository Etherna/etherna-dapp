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

import { useCallback, useEffect, useMemo, useState } from "react"

import type { EthAddress } from "@/classes/BeeClient/types"
import SwarmPlaylistIO from "@/classes/SwarmPlaylist"
import SwarmUserPlaylistsIO from "@/classes/SwarmUserPlaylists"
import type { SwarmUserPlaylistsDownloadOptions } from "@/classes/SwarmUserPlaylists/types"
import type {
  SwarmPlaylist,
  SwarmPlaylistType,
  SwarmPlaylistVideo,
  SwarmUserPlaylistsRaw,
} from "@/definitions/swarm-playlist"
import type { Video } from "@/definitions/swarm-video"
import useSelector from "@/state/useSelector"
import { deepCloneArray } from "@/utils/array"
import { deepCloneObject } from "@/utils/object"

export default function useUserPlaylists(
  owner: EthAddress,
  opts?: SwarmUserPlaylistsDownloadOptions
) {
  const beeClient = useSelector(state => state.env.beeClient)
  const [isFetchingPlaylists, setIsFetchingPlaylists] = useState(false)
  const [rawPlaylists, setRawPlaylists] = useState<SwarmUserPlaylistsRaw>()
  const [channelPlaylist, setChannelPlaylist] = useState<SwarmPlaylist>()
  const [savedPlaylist, setSavedPlaylist] = useState<SwarmPlaylist>()
  const [customPlaylists, setCustomPlaylists] = useState<SwarmPlaylist[]>()

  const allPlaylists = useMemo(() => {
    return [channelPlaylist ?? false, savedPlaylist ?? false, ...(customPlaylists ?? [])].filter(
      Boolean
    ) as SwarmPlaylist[]
  }, [channelPlaylist, savedPlaylist, customPlaylists])

  useEffect(() => {
    setRawPlaylists(undefined)
    setChannelPlaylist(undefined)
    setSavedPlaylist(undefined)
    setCustomPlaylists(undefined)
  }, [owner])

  const loadPlaylists = useCallback(async () => {
    setIsFetchingPlaylists(true)
    try {
      const reader = new SwarmUserPlaylistsIO.Reader(owner, {
        beeClient,
      })
      await reader.download(opts)

      setRawPlaylists(reader.rawPlaylists ?? undefined)
      setChannelPlaylist(reader.channelPlaylist)
      setSavedPlaylist(reader.savedPlaylist)
      setCustomPlaylists(reader.customPlaylists)

      setIsFetchingPlaylists(false)

      return {
        rawPlaylists: reader.rawPlaylists,
        channelPlaylist: reader.channelPlaylist,
        savedPlaylist: reader.savedPlaylist,
        customPlaylists: reader.customPlaylists,
      }
    } catch (error: any) {
      console.error(error)
      setIsFetchingPlaylists(false)
    }
  }, [owner, beeClient, opts])

  const playlistHasVideo = useCallback(
    (playlistId: string, reference: string) => {
      const playlist = allPlaylists.find(playlist => playlist.id === playlistId)

      if (!playlist) throw new Error("Playlist not loaded")

      const index = playlist.videos?.findIndex(video => video.reference === reference) ?? -1

      return index >= 0
    },
    [allPlaylists]
  )

  const updatePlaylist = useCallback(
    async (playlist: SwarmPlaylist, initialType: SwarmPlaylistType) => {
      const playlistWriter = new SwarmPlaylistIO.Writer(playlist, {
        beeClient,
      })
      return await playlistWriter.upload()
    },
    [beeClient]
  )

  const updateUserPlaylists = useCallback(
    async (rawPlaylists: SwarmUserPlaylistsRaw) => {
      const userPlaylistsWriter = new SwarmUserPlaylistsIO.Writer(rawPlaylists, {
        beeClient,
      })
      await userPlaylistsWriter.upload()
    },
    [beeClient]
  )

  const updatePlaylistAndUser = useCallback(
    async (initialPlaylist: SwarmPlaylist, newPlaylist: SwarmPlaylist) => {
      // update & get new reference
      const reference = await updatePlaylist(newPlaylist, initialPlaylist.type)
      newPlaylist.reference = reference
      // update raw with new reference
      const playlistsRaw = rawPlaylists ? deepCloneObject(rawPlaylists) : {}
      if (newPlaylist.id === channelPlaylist?.id) {
        playlistsRaw.channel = reference
        setChannelPlaylist(newPlaylist)
      } else if (newPlaylist.id === savedPlaylist?.id) {
        playlistsRaw.saved = reference
        setSavedPlaylist(newPlaylist)
      } else {
        const index = playlistsRaw.custom!.findIndex(ref => ref === initialPlaylist.reference)
        playlistsRaw.custom![index] = reference

        const newCustomPlaylists = [...customPlaylists!]
        newCustomPlaylists[index] = newPlaylist
        setCustomPlaylists(newCustomPlaylists)
      }
      // update user playlists
      await updateUserPlaylists(playlistsRaw)
    },
    [
      rawPlaylists,
      customPlaylists,
      channelPlaylist?.id,
      savedPlaylist?.id,
      updateUserPlaylists,
      updatePlaylist,
    ]
  )

  const addVideosToPlaylist = useCallback(
    async (playlistId: string, videos: Video[], publishedAt?: number) => {
      const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

      if (!initialPlaylist) throw new Error("Playlist not loaded")

      const newPlaylist = deepCloneObject(initialPlaylist)
      newPlaylist.videos = [
        ...videos.map(
          video =>
            ({
              reference: video.reference,
              title: video.title,
              addedAt: +new Date(),
              publishedAt: publishedAt,
            } as SwarmPlaylistVideo)
        ),
        ...(newPlaylist.videos ?? []),
      ].filter((vid, i, self) => self.findIndex(vid2 => vid2.reference === vid.reference) === i)
      await updatePlaylistAndUser(initialPlaylist, newPlaylist)
    },
    [allPlaylists, updatePlaylistAndUser]
  )

  const updateVideoInPlaylist = useCallback(
    async (playlistId: string, previousReference: string, newVideo: Video) => {
      const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

      if (!initialPlaylist) throw new Error("Playlist not loaded")

      const newPlaylist = deepCloneObject(initialPlaylist)
      const index = newPlaylist.videos?.findIndex(video => video.reference === previousReference)

      if (index == null || index === -1) {
        throw new Error(
          `Coudn't find video with reference ${previousReference} in your channel videos`
        )
      }

      newPlaylist.videos!.splice(index, 1, {
        reference: newVideo.reference,
        title: newVideo.title || "",
        addedAt: newPlaylist.videos![index].addedAt,
        publishedAt: newPlaylist.videos![index].publishedAt,
      })

      newPlaylist.videos = [...(newPlaylist.videos ?? [])].filter(
        (vid, i, self) => self.findIndex(vid2 => vid2.reference === vid.reference) === i
      )

      await updatePlaylistAndUser(initialPlaylist, newPlaylist)
    },
    [allPlaylists, updatePlaylistAndUser]
  )

  const removeVideosFromPlaylist = useCallback(
    async (playlistId: string, videosReferences: string[]) => {
      const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

      if (!initialPlaylist) throw new Error("Playlist not loaded")

      const newPlaylist = deepCloneObject(initialPlaylist)
      const newVideos = deepCloneArray(newPlaylist.videos ?? []).filter(
        video => !videosReferences.includes(video.reference)
      )
      newPlaylist.videos = newVideos
      await updatePlaylistAndUser(initialPlaylist, newPlaylist)
    },
    [allPlaylists, updatePlaylistAndUser]
  )

  return {
    isFetchingPlaylists,
    channelPlaylist,
    savedPlaylist,
    customPlaylists,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    removeVideosFromPlaylist,
    playlistHasVideo,
  }
}
