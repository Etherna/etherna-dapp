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

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmUserPlaylists from "@/classes/SwarmUserPlaylists"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { deepCloneArray } from "@/utils/array"
import { deepCloneObject } from "@/utils/object"

import type { Playlist, PlaylistVideo, UserPlaylists, Video } from "@etherna/api-js"
import type { EthAddress, Reference } from "@etherna/api-js/clients"

interface UseUserPlaylistsOptions {
  fetchChannel?: boolean
  fetchSaved?: boolean
  fetchCustom?: boolean
}

export default function useUserPlaylists(owner: EthAddress, opts?: UseUserPlaylistsOptions) {
  const address = useUserStore(state => state.address)
  const beeClient = useClientsStore(state => state.beeClient)
  const [isFetchingPlaylists, setIsFetchingPlaylists] = useState(false)
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylists>()
  const [channelPlaylist, setChannelPlaylist] = useState<Playlist>()
  const [savedPlaylist, setSavedPlaylist] = useState<Playlist>()
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>()

  const allPlaylists = useMemo(() => {
    return [channelPlaylist ?? false, savedPlaylist ?? false, ...(customPlaylists ?? [])].filter(
      Boolean
    ) as Playlist[]
  }, [channelPlaylist, savedPlaylist, customPlaylists])

  useEffect(() => {
    setUserPlaylists(undefined)
    setChannelPlaylist(undefined)
    setSavedPlaylist(undefined)
    setCustomPlaylists(undefined)
  }, [owner])

  const fetchPlaylist = useCallback(
    async (
      reference: string | undefined | null,
      id: string | undefined,
      owner: EthAddress | undefined
    ) => {
      const playlistReader = new SwarmPlaylist.Reader(reference as Reference, {
        beeClient,
        playlistId: id,
        playlistOwner: owner,
      })
      return await playlistReader.download()
    },
    [beeClient]
  )

  const loadPlaylists = useCallback(async () => {
    setIsFetchingPlaylists(true)
    try {
      const reader = new SwarmUserPlaylists.Reader(owner, {
        beeClient,
      })

      const playlists = await reader.download()

      setUserPlaylists(playlists)

      const [channelResult, savedResult, customResult] = await Promise.allSettled([
        opts?.fetchChannel
          ? fetchPlaylist(playlists.channel, SwarmPlaylist.Reader.channelPlaylistId, owner)
          : undefined,
        opts?.fetchSaved
          ? fetchPlaylist(playlists.saved, SwarmPlaylist.Reader.savedPlaylistId, owner)
          : undefined,
        opts?.fetchCustom
          ? Promise.all(
              playlists.custom.map(async playlistReference => {
                return await fetchPlaylist(playlistReference, undefined, undefined)
              })
            )
          : undefined,
      ])

      const channelPlaylist = channelResult.status === "fulfilled" ? channelResult.value : undefined
      const savedPlaylist = savedResult.status === "fulfilled" ? savedResult.value : undefined
      const customPlaylists = customResult.status === "fulfilled" ? customResult.value : undefined

      opts?.fetchChannel &&
        setChannelPlaylist(
          channelPlaylist ?? SwarmUserPlaylists.Writer.defaultChannelPlaylists(address!)
        )
      opts?.fetchSaved &&
        setSavedPlaylist(
          savedPlaylist ?? SwarmUserPlaylists.Writer.defaultChannelPlaylists(address!)
        )
      opts?.fetchCustom && setCustomPlaylists(customPlaylists ?? [])

      setIsFetchingPlaylists(false)

      return {
        userPlaylists: playlists,
        channelPlaylist: channelPlaylist,
        savedPlaylist: savedPlaylist,
        customPlaylists: customPlaylists,
      }
    } catch (error: any) {
      console.error(error)
      setIsFetchingPlaylists(false)
    }
  }, [
    beeClient,
    address,
    owner,
    opts?.fetchChannel,
    opts?.fetchSaved,
    opts?.fetchCustom,
    fetchPlaylist,
  ])

  const playlistHasVideo = useCallback(
    (playlistId: string, reference: string) => {
      const playlist = allPlaylists.find(playlist => playlist.id === playlistId)

      if (!playlist) throw new Error("Playlist not loaded")

      const index = playlist.videos?.findIndex(video => video.reference === reference) ?? -1

      return index >= 0
    },
    [allPlaylists]
  )

  const uploadPlaylist = useCallback(
    async (playlist: Playlist) => {
      if (playlist.reference === "") {
        playlist.reference = "0".repeat(64)
      }
      const playlistWriter = new SwarmPlaylist.Writer(playlist, {
        beeClient,
      })
      return await playlistWriter.upload()
    },
    [beeClient]
  )

  const updateUserPlaylists = useCallback(
    async (userPlaylists: UserPlaylists) => {
      const userPlaylistsWriter = new SwarmUserPlaylists.Writer(userPlaylists, {
        beeClient,
      })
      await userPlaylistsWriter.upload()
    },
    [beeClient]
  )

  const updatePlaylistAndUser = useCallback(
    async (initialPlaylist: Playlist, newPlaylist: Playlist) => {
      // update & get new reference
      const reference = await uploadPlaylist(newPlaylist)
      newPlaylist.reference = reference
      // update raw with new reference
      const updatedUserPlaylists: UserPlaylists = userPlaylists
        ? deepCloneObject(userPlaylists)
        : {
            channel: null,
            saved: null,
            custom: [],
          }
      if (newPlaylist.id === channelPlaylist?.id) {
        updatedUserPlaylists.channel = reference
        setChannelPlaylist(newPlaylist)
      } else if (newPlaylist.id === savedPlaylist?.id) {
        updatedUserPlaylists.saved = reference
        setSavedPlaylist(newPlaylist)
      } else {
        const index = updatedUserPlaylists.custom!.findIndex(
          ref => ref === initialPlaylist.reference
        )
        updatedUserPlaylists.custom![index] = reference

        const newCustomPlaylists = [...customPlaylists!]
        newCustomPlaylists[index] = newPlaylist
        setCustomPlaylists(newCustomPlaylists)
      }
      // update user playlists
      await updateUserPlaylists(updatedUserPlaylists)
    },
    [
      userPlaylists,
      customPlaylists,
      channelPlaylist?.id,
      savedPlaylist?.id,
      updateUserPlaylists,
      uploadPlaylist,
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
              title: video.preview.title,
              addedAt: +new Date(),
              publishedAt: publishedAt,
            } as PlaylistVideo)
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
        title: newVideo.preview.title || "",
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

  const updateVideosInPlaylist = useCallback(
    async (playlistId: string, operations: { remove: Reference; add: Video }[]) => {
      const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

      if (!initialPlaylist) throw new Error("Playlist not loaded")

      const newPlaylist = deepCloneObject(initialPlaylist)

      for (const operation of operations) {
        const index = newPlaylist.videos?.findIndex(video => video.reference === operation.remove)
        const vid: PlaylistVideo = {
          reference: operation.add.reference,
          title: operation.add.preview.title || "",
          addedAt: newPlaylist.videos![index].addedAt,
          publishedAt: newPlaylist.videos![index].publishedAt,
        }
        if (index >= 0) {
          newPlaylist.videos!.splice(index, 1, vid)
        } else {
          newPlaylist.videos!.push(vid)
        }
      }

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
    userPlaylists,
    isFetchingPlaylists,
    channelPlaylist,
    savedPlaylist,
    customPlaylists,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    updateVideosInPlaylist,
    removeVideosFromPlaylist,
    playlistHasVideo,
  }
}
