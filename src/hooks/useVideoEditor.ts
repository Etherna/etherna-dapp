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

import { useCallback, useEffect, useRef, useState } from "react"
import type { Video } from "@etherna/api-js"
import type { BatchId } from "@etherna/api-js/clients"
import { EthernaResourcesHandler } from "@etherna/api-js/handlers"
import type { AxiosError } from "axios"

import useErrorMessage from "./useErrorMessage"
import useWallet from "./useWallet"
import IndexClient from "@/classes/IndexClient"
import SwarmVideo from "@/classes/SwarmVideo"
import useUserPlaylists from "@/hooks/useUserPlaylists"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import type { VideoEditorPublishSource } from "@/stores/video-editor"
import useVideoEditorStore from "@/stores/video-editor"
import { getResponseErrorMessage } from "@/utils/request"

type SaveOpts = {
  saveManifest: boolean
  offerResources: boolean
}

export type PublishStatus = {
  source: VideoEditorPublishSource
  ok: boolean
  type: "add" | "remove"
}

export default function useVideoEditor() {
  const video = useVideoEditorStore(state => state.video)
  const saveTo = useVideoEditorStore(state => state.saveTo)
  const initialReference = useVideoEditorStore(state => state.reference)
  const publishingResults = useVideoEditorStore(state => state.publishingResults)
  const updateEditorStatus = useVideoEditorStore(state => state.updateEditorStatus)
  const updateVideoReference = useVideoEditorStore(state => state.updateVideoReference)
  const setPublishingResults = useVideoEditorStore(state => state.setPublishingResults)

  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const address = useUserStore(state => state.address)
  const { isLocked } = useWallet()

  const [isSaving, setIsSaving] = useState(false)
  const newVideo = useRef<Video>()

  const { showError } = useErrorMessage()

  const {
    channelPlaylist,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    removeVideosFromPlaylist,
    playlistHasVideo,
  } = useUserPlaylists(address!, { fetchChannel: true })

  useEffect(() => {
    if (address) {
      loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const resetState = useCallback(() => {
    setPublishingResults(undefined)
    setIsSaving(false)
  }, [setPublishingResults])

  const checkAccountability = useCallback(() => {
    if (isLocked) {
      showError("Wallet Locked", "Please unlock your wallet before saving.")
      return false
    }

    return true
  }, [isLocked, showError])

  const checkChannel = useCallback(() => {
    if (!channelPlaylist) {
      showError("Channel error", "Channel video list not fetched correctly.")
      return false
    }

    return true
  }, [channelPlaylist, showError])

  const validateMetadata = useCallback(() => {
    const { duration, originalQuality, batchId } = video

    if (!duration || !originalQuality) {
      showError(
        "Metadata error",
        "There was a problem loading the video metadata. Try to re-upload the original video."
      )
      return false
    }

    if (!batchId) {
      showError("Postage batch error", "Postage batch is missing. Cannot save video.")
      return false
    }

    return true
  }, [video, showError])

  const uploadManifest = useCallback(async () => {
    if (!checkAccountability()) return

    try {
      const batchId = video.batchId! as BatchId
      const videoWriter = new SwarmVideo.Writer(video, { batchId, beeClient })
      const newReference = await videoWriter.upload()
      return newReference
    } catch (error: any) {
      showError("Manifest error", getResponseErrorMessage(error))
      return null
    }
  }, [video, beeClient, checkAccountability, showError])

  const addToPlaylist = useCallback(
    async (id: string) => {
      if (!checkChannel()) return false
      if (!checkAccountability()) return false

      try {
        const isUpdate = initialReference && playlistHasVideo(id, initialReference)
        !isUpdate && (await addVideosToPlaylist(id, [newVideo.current!]))
        isUpdate && (await updateVideoInPlaylist(id, initialReference, newVideo.current!))
        return true
      } catch (error) {
        return false
      }
    },
    [
      initialReference,
      checkChannel,
      checkAccountability,
      playlistHasVideo,
      addVideosToPlaylist,
      updateVideoInPlaylist,
    ]
  )

  const removeFromPlaylist = useCallback(
    async (id: string) => {
      if (!checkChannel()) return false
      if (!checkAccountability()) return false

      try {
        initialReference && (await removeVideosFromPlaylist(id, [initialReference]))
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [initialReference, checkAccountability, checkChannel, removeVideosFromPlaylist]
  )

  const getVideoIndexId = useCallback(
    (indexUrl: string) => {
      return saveTo.find(s => s.source === "index" && s.identifier === indexUrl)!.videoId
    },
    [saveTo]
  )

  const addToIndex = useCallback(
    async (url: string) => {
      try {
        const indexReference = getVideoIndexId(url)

        const indexClient = new IndexClient(url)
        if (indexReference) {
          await indexClient.videos.updateVideo(indexReference, newVideo.current!.reference)
        } else {
          await indexClient.videos.createVideo(newVideo.current!.reference)
        }
        return true
      } catch (error) {
        const axiosError = error as AxiosError
        const data = (axiosError.response?.data as any) ?? ""
        if (/duplicate/i.test(data.toString()) && axiosError.response?.status === 400) {
          return true
        }
        return false
      }
    },
    [getVideoIndexId]
  )

  const removeFromIndex = useCallback(
    async (url: string) => {
      const indexReference = getVideoIndexId(url)

      if (!indexReference) return true

      try {
        const indexClient = new IndexClient(url)
        await indexClient.videos.deleteVideo(indexReference)
        return true
      } catch (error) {
        const axiosError = error as AxiosError
        if (axiosError.response?.status === 404) {
          return true
        }
        return false
      }
    },
    [getVideoIndexId]
  )

  const offerVideoResources = useCallback(async () => {
    try {
      const handler = new EthernaResourcesHandler(newVideo.current!, { gatewayClient })
      await handler.offerResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }, [gatewayClient])

  const unofferVideoResources = useCallback(async () => {
    try {
      // using 'old' video reference to unoffer resources
      const handler = new EthernaResourcesHandler(video, { gatewayClient })
      await handler.unofferResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }, [gatewayClient, video])

  const saveVideoTo = useCallback(
    async (saveToSources: VideoEditorPublishSource[], opts: SaveOpts) => {
      const { saveManifest, offerResources } = opts

      setIsSaving(true)

      // Unoffer previous resources before offering new ones
      if (saveManifest && initialReference) {
        const offered = await unofferVideoResources()
        if (!offered) {
          console.error("Coudn't un-offer previous resources")
        }
      }

      // Upload metadata
      if (saveManifest && !validateMetadata()) return setIsSaving(false)
      const newReference =
        saveManifest || !video.reference ? await uploadManifest() : video.reference

      if (!newReference) return setIsSaving(false)

      newVideo.current = {
        ...video,
        reference: newReference,
      }
      updateVideoReference(newReference)

      // Add/remove to sources
      const newPublishResults: PublishStatus[] = JSON.parse(JSON.stringify(publishingResults ?? []))
      for (const source of saveToSources) {
        // don't remove on creation
        if (!source.add && !initialReference) continue

        let statusIndex = newPublishResults.findIndex(
          ps => ps.source.source === source.source && ps.source.identifier === source.identifier
        )

        if (statusIndex === -1) {
          const fullSource = saveTo.find(
            s => s.source === source.source && s.identifier === source.identifier
          )!
          newPublishResults.push({ source: fullSource, ok: false, type: "add" })
          statusIndex = newPublishResults.length - 1
        }

        if (source.source === "playlist") {
          if (source.add) {
            const ok = await addToPlaylist(source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "add"
          } else {
            const ok = await removeFromPlaylist(source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "remove"
          }
        } else if (source.source === "index") {
          if (source.add) {
            const ok = await addToIndex(source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "add"
          } else {
            const ok = await removeFromIndex(source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "remove"
          }
        }
      }
      setPublishingResults(newPublishResults)

      // Offer resources
      if (offerResources) {
        const offered = await offerVideoResources()
        if (!offered) {
          console.error("Coudn't offer resources")
        }
      }

      const hasErrors = newPublishResults.some(ps => !ps.ok)
      updateEditorStatus(hasErrors ? "error" : "saved")
      updateVideoReference(newReference)
      setIsSaving(false)
    },
    [
      initialReference,
      publishingResults,
      saveTo,
      video,
      validateMetadata,
      uploadManifest,
      updateVideoReference,
      setPublishingResults,
      updateEditorStatus,
      unofferVideoResources,
      addToPlaylist,
      removeFromPlaylist,
      addToIndex,
      removeFromIndex,
      offerVideoResources,
    ]
  )

  return {
    isSaving,
    saveVideoTo: (sources: VideoEditorPublishSource[], offerResources = false) =>
      saveVideoTo(sources, {
        saveManifest: true,
        offerResources,
      }),
    reSaveTo: (source: VideoEditorPublishSource) =>
      saveVideoTo([source], {
        saveManifest: false,
        offerResources: false,
      }),
    saveVideoResources: () =>
      saveVideoTo([], {
        saveManifest: false,
        offerResources: true,
      }),
    resetState,
  }
}
