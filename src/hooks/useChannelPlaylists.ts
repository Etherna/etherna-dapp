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
import { parsePlaylistIdFromTopic } from "@etherna/sdk-js/swarm"
import { EmptyReference } from "@etherna/sdk-js/utils"

import useSwarmProfile from "./useSwarmProfile"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmProfile from "@/classes/SwarmProfile"
import SwarmUserPlaylists from "@/classes/SwarmUserPlaylists"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { deepCloneArray } from "@/utils/array"
import { deepCloneObject } from "@/utils/object"

import type { Playlist, PlaylistVideo, UserPlaylists, Video } from "@etherna/sdk-js"
import type { EthAddress, Reference } from "@etherna/sdk-js/clients"

interface UseUserPlaylistsOptions {
  mode: "channel" | "all"
}

export default function useChannelPlaylists(owner: EthAddress, opts?: UseUserPlaylistsOptions) {
  const address = useUserStore(state => state.address)
  const beeClient = useClientsStore(state => state.beeClient)
  const swarmProfile = useSwarmProfile({
    address: owner,
    mode: "full",
  })
  const [isFetchingPlaylists, setIsFetchingPlaylists] = useState(false)
  const [channelPlaylist, setChannelPlaylist] = useState<Playlist>()
  const [channelPlaylists, setChannelPlaylists] = useState<Playlist[]>()

  const allPlaylists = useMemo(() => {
    return [channelPlaylist ?? null, ...(channelPlaylists ?? [])].filter(Boolean)
  }, [channelPlaylist, channelPlaylists])

  useEffect(() => {
    setChannelPlaylist(undefined)
    setChannelPlaylists(undefined)
  }, [owner])

  const fetchPlaylist = useCallback(
    async (opts: { id: string; owner: EthAddress } | { rootManifest: Reference }) => {
      let id: string
      let owner: EthAddress

      if ("rootManifest" in opts) {
        const feed = await beeClient.feed.parseFeedFromRootManifest(opts.rootManifest)
        id = parsePlaylistIdFromTopic(feed.topic)
        owner = `0x${feed.owner}`
      } else {
        id = opts.id
        owner = opts.owner
      }

      const playlistReader = new SwarmPlaylist.Reader(id, owner, {
        beeClient,
      })
      return await playlistReader.download()
    },
    [beeClient]
  )

  const loadPlaylists = useCallback(async () => {
    setIsFetchingPlaylists(true)
    try {
      const { details } =
        opts?.mode === "all" ? await swarmProfile.loadProfile() : { details: undefined }
      const playlistsReferences = details?.playlists ?? []

      const [channelResult, playlistsResult] = await Promise.allSettled([
        fetchPlaylist({ id: SwarmPlaylist.Reader.channelPlaylistId, owner }),
        Promise.all(
          playlistsReferences.map(async rootManifest => {
            return await fetchPlaylist({
              rootManifest,
            })
          })
        ),
      ])

      const channelPlaylist = channelResult.status === "fulfilled" ? channelResult.value : undefined
      const channelPlaylists =
        playlistsResult.status === "fulfilled" ? playlistsResult.value : undefined

      setChannelPlaylist(
        channelPlaylist ?? SwarmUserPlaylists.Writer.defaultChannelPlaylists(address!)
      )

      if (opts?.mode === "all") {
        setChannelPlaylists(channelPlaylists ?? [])
      }

      return {
        channelPlaylist,
        channelPlaylists,
      }
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsFetchingPlaylists(false)
    }
  }, [opts?.mode, swarmProfile, fetchPlaylist, owner, address])

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
      const playlistWriter = new SwarmPlaylist.Writer(playlist, {
        beeClient,
      })
      return await playlistWriter.upload()
    },
    [beeClient]
  )

  const updatePlaylistAndUser = useCallback(
    async (initialPlaylist: Playlist, newPlaylist: Playlist) => {
      // update & get new reference
      const reference = await uploadPlaylist(newPlaylist)
      newPlaylist.reference = reference

      // update raw with new referenc
      if (newPlaylist.id === channelPlaylist?.id) {
        setChannelPlaylist(newPlaylist)
      } else {
        setChannelPlaylists(
          channelPlaylists?.map(playlist =>
            playlist.id === newPlaylist.id ? newPlaylist : playlist
          )
        )
      }
    },
    [channelPlaylist?.id, channelPlaylists, uploadPlaylist]
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
            }) as PlaylistVideo
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
    isFetchingPlaylists,
    channelPlaylist,
    channelPlaylists,
    allPlaylists,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    updateVideosInPlaylist,
    removeVideosFromPlaylist,
    playlistHasVideo,
  }
}
