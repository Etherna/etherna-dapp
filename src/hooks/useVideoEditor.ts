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

import { useCallback, useEffect, useState } from "react"
import { VideoBuilder } from "@etherna/api-js/swarm"
import { immerable } from "immer"

import useUserPlaylists from "./useUserPlaylists"
import useWallet from "./useWallet"
import VideoSaver from "@/classes/VideoSaver"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import useVideoEditorStore from "@/stores/video-editor"

import type { VideoEditorPublishSource } from "@/stores/video-editor"

type SaveOpts = {
  saveManifest: boolean
  offerResources: boolean
  pinResources: boolean
}

export default function useVideoEditor() {
  const previusReferences = useVideoEditorStore(state => state.references)
  const initialReference = useVideoEditorStore(state => state.reference)
  const publishingResults = useVideoEditorStore(state => state.publishingResults)
  const builder = useVideoEditorStore(state => state.builder)
  const updateEditorStatus = useVideoEditorStore(state => state.updateEditorStatus)
  const setPublishingResults = useVideoEditorStore(state => state.setPublishingResults)

  const address = useUserStore(state => state.address!)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const indexClient = useClientsStore(state => state.indexClient)
  const { isLocked } = useWallet()
  const [isSaving, setIsSaving] = useState(false)

  const { userPlaylists, channelPlaylist, loadPlaylists } = useUserPlaylists(address!, {
    fetchChannel: true,
  })

  useEffect(() => {
    loadPlaylists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetState = useCallback(() => {
    setPublishingResults(undefined)
    setIsSaving(false)
  }, [setPublishingResults])

  const saveVideoTo = useCallback(
    async (saveToSources: VideoEditorPublishSource[], opts: SaveOpts) => {
      const { saveManifest, offerResources, pinResources } = opts

      setIsSaving(true)

      const cloneBuilder = VideoBuilder.unimmerable(builder)
      const videoSaver = new VideoSaver(cloneBuilder, {
        beeClient,
        gatewayClient,
        indexClient,
        channelPlaylist,
        initialReference,
        previusReferences,
        userPlaylists,
        isWalletConnected: !isLocked,
        saveTo: saveToSources,
      })
      const newPublishResults = await videoSaver.save({
        offerResources,
        pinResources,
        saveManifest,
        previusResults: publishingResults ?? [],
      })
      setIsSaving(false)

      if (newPublishResults) {
        setPublishingResults(newPublishResults)

        const hasErrors = newPublishResults.some(ps => !ps.ok)
        updateEditorStatus(hasErrors ? "error" : "saved")
      }
    },
    [
      beeClient,
      builder,
      channelPlaylist,
      gatewayClient,
      indexClient,
      initialReference,
      isLocked,
      previusReferences,
      publishingResults,
      userPlaylists,
      setPublishingResults,
      updateEditorStatus,
    ]
  )

  return {
    isSaving,
    saveVideoTo: (
      sources: VideoEditorPublishSource[],
      offerResources = false,
      pinResources = false
    ) =>
      saveVideoTo(sources, {
        saveManifest: true,
        offerResources,
        pinResources,
      }),
    reSaveTo: (source: VideoEditorPublishSource) =>
      saveVideoTo([source], {
        saveManifest: false,
        offerResources: false,
        pinResources: false,
      }),
    saveVideoResources: () =>
      saveVideoTo([], {
        saveManifest: false,
        offerResources: true,
        pinResources: false,
      }),
    resetState,
  }
}
