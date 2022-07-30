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

import { useEffect, useMemo, useState } from "react"

import SwarmUserPlaylistsIO from "@/classes/SwarmUserPlaylists"
import SwarmPlaylistIO from "@/classes/SwarmPlaylist"
import useSelector from "@/state/useSelector"
import { showError } from "@/state/actions/modals"
import { deepCloneObject } from "@/utils/object"
import { deepCloneArray } from "@/utils/array"
import type { SwarmUserPlaylistsDownloadOptions } from "@/classes/SwarmUserPlaylists/types"
import type { Video } from "@/definitions/swarm-video"
import type {
  SwarmPlaylist,
  SwarmPlaylistType,
  SwarmPlaylistVideo,
  SwarmUserPlaylistsRaw
} from "@/definitions/swarm-playlist"

export default function useUserPlaylists(owner: string, opts?: SwarmUserPlaylistsDownloadOptions) {
  const { beeClient, indexUrl } = useSelector(state => state.env)
  const [isFetchingPlaylists, setIsFetchingPlaylists] = useState(false)
  const [rawPlaylists, setRawPlaylists] = useState<SwarmUserPlaylistsRaw>()
  const [channelPlaylist, setChannelPlaylist] = useState<SwarmPlaylist>()
  const [savedPlaylist, setSavedPlaylist] = useState<SwarmPlaylist>()
  const [customPlaylists, setCustomPlaylists] = useState<SwarmPlaylist[]>()

  const allPlaylists = useMemo(() => {
    return [
      channelPlaylist ?? false,
      savedPlaylist ?? false,
      ...(customPlaylists ?? [])
    ].filter(Boolean) as SwarmPlaylist[]
  }, [channelPlaylist, savedPlaylist, customPlaylists])

  useEffect(() => {
    setRawPlaylists(undefined)
    setChannelPlaylist(undefined)
    setSavedPlaylist(undefined)
    setCustomPlaylists(undefined)
  }, [owner])

  const loadPlaylists = async () => {
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
  }

  const addVideosToPlaylist = async (playlistId: string, videos: Video[], publishedAt?: number) => {
    const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

    if (!initialPlaylist) return showError("Playlist not loaded", "")

    const newPlaylist = deepCloneObject(initialPlaylist)
    newPlaylist.videos = [
      ...videos.map(video => ({
        reference: video.reference,
        title: video.title,
        addedAt: +new Date(),
        publishedAt: publishedAt,
      } as SwarmPlaylistVideo)),
      ...(newPlaylist.videos ?? []),
    ].filter((vid, i, self) => self.findIndex(vid2 => vid2.reference === vid.reference) === i)
    await updatePlaylistAndUser(initialPlaylist, newPlaylist)
  }

  const updateVideoInPlaylist = async (playlistId: string, previousReference: string, newVideo: Video) => {
    const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

    if (!initialPlaylist) return showError("Playlist not loaded", "")

    const newPlaylist = deepCloneObject(initialPlaylist)
    const index = newPlaylist.videos?.findIndex(video => video.reference === previousReference)

    if (index != null && index >= 0) {
      newPlaylist.videos!.splice(index, 1, {
        reference: newVideo.reference,
        title: newVideo.title || "",
        addedAt: newPlaylist.videos![index].addedAt,
        publishedAt: newPlaylist.videos![index].publishedAt,
      })
    }
    newPlaylist.videos = [
      ...(newPlaylist.videos ?? []),
    ].filter((vid, i, self) => self.findIndex(vid2 => vid2.reference === vid.reference) === i)
    await updatePlaylistAndUser(initialPlaylist, newPlaylist)
  }

  const removeVideosFromPlaylist = async (playlistId: string, videosReferences: string[]) => {
    const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

    if (!initialPlaylist) return showError("Playlist not loaded", "")

    const newPlaylist = deepCloneObject(initialPlaylist)
    const newVideos = deepCloneArray(newPlaylist.videos ?? [])
      .filter(video => !videosReferences.includes(video.reference))
    newPlaylist.videos = newVideos
    await updatePlaylistAndUser(initialPlaylist, newPlaylist)
  }

  const updatePlaylistAndUser = async (initialPlaylist: SwarmPlaylist, newPlaylist: SwarmPlaylist) => {
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
  }

  const updatePlaylist = async (playlist: SwarmPlaylist, initialType: SwarmPlaylistType) => {
    const playlistWriter = new SwarmPlaylistIO.Writer(playlist, {
      beeClient,
      initialType,
    })
    return await playlistWriter.upload()
  }

  const updateUserPlaylists = async (rawPlaylists: SwarmUserPlaylistsRaw) => {
    const userPlaylistsWriter = new SwarmUserPlaylistsIO.Writer(rawPlaylists, {
      beeClient,
    })
    await userPlaylistsWriter.upload()
  }

  return {
    isFetchingPlaylists,
    channelPlaylist,
    savedPlaylist,
    customPlaylists,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    removeVideosFromPlaylist,
  }
}
