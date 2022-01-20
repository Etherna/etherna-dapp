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

import SwarmUserPlaylistsIO from "@classes/SwarmUserPlaylists"
import SwarmPlaylistIO from "@classes/SwarmPlaylist"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import { deepCloneObject } from "@utils/object"
import { deepCloneArray } from "@utils/array"
import type { SwarmUserPlaylistsDownloadOptions } from "@classes/SwarmUserPlaylists/types"
import type { SwarmPlaylist, SwarmPlaylistType, SwarmUserPlaylistsRaw } from "@definitions/swarm-playlist"

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
        indexUrl,
      })
      await reader.download(opts)

      setRawPlaylists(reader.rawPlaylists)
      setChannelPlaylist(reader.channelPlaylist)
      setSavedPlaylist(reader.savedPlaylist)
      setCustomPlaylists(reader.customPlaylists)
    } catch (error: any) {
      console.error(error)
    }
    setIsFetchingPlaylists(false)
  }

  const addVideoToPlaylist = async (playlistId: string, videoReference: string) => {
    const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

    if (!initialPlaylist) return showError("Playlist not loaded", "")

    const newPlaylist = deepCloneObject(initialPlaylist)
    newPlaylist.videos = [
      videoReference,
      ...(newPlaylist.videos ?? []),
    ]
    await updatePlaylistAndUser(initialPlaylist, newPlaylist)
  }

  const removeVideoFromPlaylist = async (playlistId: string, videoReference: string) => {
    const initialPlaylist = allPlaylists.find(playlist => playlist.id === playlistId)

    if (!initialPlaylist) return showError("Playlist not loaded", "")

    const newPlaylist = deepCloneObject(initialPlaylist)
    const newVideos = deepCloneArray(newPlaylist.videos ?? [])
    const videoIndex = newVideos.findIndex(ref => ref === videoReference)
    newVideos.splice(videoIndex, 1)
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
      indexUrl,
      initialType,
    })
    return await playlistWriter.upload()
  }

  const updateUserPlaylists = async (rawPlaylists: SwarmUserPlaylistsRaw) => {
    const userPlaylistsWriter = new SwarmUserPlaylistsIO.Writer(rawPlaylists, {
      beeClient,
      indexUrl,
    })
    await userPlaylistsWriter.upload()
  }

  return {
    isFetchingPlaylists,
    channelPlaylist,
    savedPlaylist,
    customPlaylists,
    loadPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
  }
}