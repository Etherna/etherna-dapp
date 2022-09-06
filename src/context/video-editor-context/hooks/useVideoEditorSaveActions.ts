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
import { useEffect, useState } from "react"
import type { AxiosError } from "axios"

import VideoEditorCache from "../VideoEditorCache"
import useVideoEditorState from "./useVideoEditorState"
import EthernaIndexClient from "@/classes/EthernaIndexClient"
import SwarmResourcesIO from "@/classes/SwarmResources"
import type { Profile } from "@/definitions/swarm-profile"
import type { PublishSource, PublishSourceSave } from "@/definitions/video-editor-context"
import useUserPlaylists from "@/hooks/useUserPlaylists"
import { useWallet } from "@/state/hooks/env"
import { useErrorMessage } from "@/state/hooks/ui"
import useSelector from "@/state/useSelector"
import { getResponseErrorMessage } from "@/utils/request"

type SaveOpts = {
  saveManifest: boolean
  offerResources: boolean
}

export type PublishStatus = {
  source: PublishSource
  ok: boolean
  type: "add" | "remove"
}

export default function useVideoEditorSaveActions() {
  const [state] = useVideoEditorState()
  const { videoWriter, sources, reference: initialReference } = state
  const { gatewayClient } = useSelector(state => state.env)
  const { address, defaultBatch } = useSelector(state => state.user)
  const profile = useSelector(state => state.profile)
  const { isLocked } = useWallet()

  const [reference, setReference] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [publishStatus, setPublishStatus] = useState<PublishStatus[]>()
  const [resourcesOffered, setResourcesOffered] = useState<boolean>()

  const { showError } = useErrorMessage()

  const {
    channelPlaylist,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    removeVideosFromPlaylist,
    playlistHasVideo,
  } = useUserPlaylists(address!, { resolveChannel: true })

  useEffect(() => {
    if (address) {
      loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const saveVideoTo = async (saveToSources: PublishSourceSave[], opts: SaveOpts) => {
    const { saveManifest, offerResources } = opts

    setIsSaving(true)

    // Unoffer previous resources before offering new ones
    if (saveManifest && initialReference) {
      setResourcesOffered(undefined)
      const offered = await unofferVideoResources()
      setResourcesOffered(offered)
    }

    // Upload metadata
    if (saveManifest && !validateMetadata()) return setIsSaving(false)
    const newReference = saveManifest ? await uploadManifest() : reference
    if (!newReference) return setIsSaving(false)

    // Add/remove to sources
    const newPublishStatus: PublishStatus[] = [...(publishStatus ?? [])]
    for (const source of saveToSources) {
      let statusIndex = newPublishStatus.findIndex(
        ps => ps.source.source === source.source && ps.source.identifier === source.identifier
      )

      if (statusIndex === -1) {
        const fullSource = sources.find(
          s => s.source === source.source && s.identifier === source.identifier
        )!
        newPublishStatus.push({ source: fullSource, ok: false, type: "add" })
        statusIndex = newPublishStatus.length - 1
      }

      if (source.source === "playlist") {
        if (source.add) {
          const ok = await addToPlaylist(source.identifier)
          newPublishStatus[statusIndex].ok = ok
          newPublishStatus[statusIndex].type = "add"
        } else {
          const ok = await removeFromPlaylist(source.identifier)
          newPublishStatus[statusIndex].ok = ok
          newPublishStatus[statusIndex].type = "remove"
        }
      } else if (source.source === "index") {
        if (source.add) {
          const ok = await addToIndex(source.identifier)
          newPublishStatus[statusIndex].ok = ok
          newPublishStatus[statusIndex].type = "add"
        } else {
          const ok = await removeFromIndex(source.identifier)
          newPublishStatus[statusIndex].ok = ok
          newPublishStatus[statusIndex].type = "remove"
        }
      }
    }
    setPublishStatus(newPublishStatus)

    // Offer resources
    if (offerResources) {
      setResourcesOffered(undefined)

      const offered = await offerVideoResources()
      setResourcesOffered(offered)
    }

    // Clear cache
    VideoEditorCache.deleteCache()

    setReference(newReference)
    setIsSaving(false)
  }

  const resetState = () => {
    setPublishStatus(undefined)
    setReference(undefined)
    setIsSaving(false)
  }

  const checkAccountability = () => {
    if (isLocked) {
      showError("Wallet Locked", "Please unlock your wallet before saving.")
      return false
    }

    return true
  }

  const checkChannel = () => {
    if (!channelPlaylist) {
      showError("Channel error", "Channel video list not fetched correctly.")
      return false
    }

    return true
  }

  const validateMetadata = () => {
    const { duration, originalQuality } = videoWriter.videoRaw

    if (!duration || !originalQuality) {
      showError(
        "Metadata error",
        "There was a problem loading the video metadata. Try to re-upload the original video."
      )
      return false
    }

    return true
  }

  const uploadManifest = async () => {
    if (!checkAccountability()) return

    try {
      const ownerProfile: Profile = {
        address: address!,
        name: profile.name ?? null,
        description: profile.description ?? null,
        avatar: profile.avatar ?? null,
        cover: profile.cover ?? null,
        birthday: profile.birthday,
        location: profile.location,
        website: profile.website,
      }
      const newReference = await videoWriter.update(ownerProfile)
      return newReference
    } catch (error: any) {
      showError("Manifest error", getResponseErrorMessage(error))
      return null
    }
  }

  const addToPlaylist = async (id: string) => {
    if (!checkChannel()) return false
    if (!checkAccountability()) return false

    try {
      const isUpdate = initialReference && playlistHasVideo(id, initialReference)
      !isUpdate && (await addVideosToPlaylist(id, [videoWriter.video!]))
      isUpdate && (await updateVideoInPlaylist(id, initialReference, videoWriter.video!))
      return true
    } catch (error) {
      return false
    }
  }

  const removeFromPlaylist = async (id: string) => {
    if (!checkChannel()) return false
    if (!checkAccountability()) return false

    try {
      initialReference && (await removeVideosFromPlaylist(id, [initialReference]))
      return true
    } catch (error) {
      return false
    }
  }

  const getVideoIndexId = (indexUrl: string) => {
    return sources.find(s => s.source === "index" && s.identifier === indexUrl)!.videoId
  }

  const addToIndex = async (url: string) => {
    try {
      const indexReference = getVideoIndexId(url)

      const indexClient = new EthernaIndexClient({
        host: url,
      })
      if (indexReference) {
        await indexClient.videos.updateVideo(indexReference, videoWriter.reference!)
      } else {
        await indexClient.videos.createVideo(videoWriter.reference!)
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
  }

  const removeFromIndex = async (url: string) => {
    const indexReference = getVideoIndexId(url)

    if (!indexReference) return true

    try {
      const indexClient = new EthernaIndexClient({
        host: url,
      })
      await indexClient.videos.deleteVideo(indexReference)
      videoWriter.indexReference = undefined
      return true
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        return true
      }
      return false
    }
  }

  const offerVideoResources = async () => {
    if (!videoWriter.video) return false

    try {
      const writer = new SwarmResourcesIO.Writer(videoWriter.video, { gatewayClient })
      await writer.offerResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const unofferVideoResources = async () => {
    if (!videoWriter.video) return false

    try {
      const writer = new SwarmResourcesIO.Writer(videoWriter.video, { gatewayClient })
      await writer.unofferResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }

  return {
    reference,
    isSaving,
    resourcesOffered,
    publishStatus,
    saveVideoTo: (sources: PublishSourceSave[], offerResources = false) =>
      saveVideoTo(sources, {
        saveManifest: true,
        offerResources,
      }),
    reSaveTo: (source: PublishSourceSave) =>
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
