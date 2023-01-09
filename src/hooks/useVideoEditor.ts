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
import { useCallback, useState } from "react"
import { EthernaPinningHandler, EthernaResourcesHandler } from "@etherna/api-js/handlers"
import { VideoDeserializer } from "@etherna/api-js/serializers"

import useErrorMessage from "./useErrorMessage"
import useVideoPublish from "./useVideoPublish"
import useWallet from "./useWallet"
import useClientsStore from "@/stores/clients"
import useVideoEditorStore from "@/stores/video-editor"
import { getResponseErrorMessage } from "@/utils/request"

import type { VideoEditorPublishSource } from "@/stores/video-editor"
import type { Video } from "@etherna/api-js"
import type { Reference } from "@etherna/api-js/clients"

type SaveOpts = {
  saveManifest: boolean
  offerResources: boolean
  pinResources: boolean
}

export type PublishStatus = {
  source: VideoEditorPublishSource
  ok: boolean
  type: "add" | "remove"
}

export default function useVideoEditor() {
  const currentReference = useVideoEditorStore(state => state.builder.reference)
  const previewMeta = useVideoEditorStore(state => state.builder.previewMeta)
  const detailsMeta = useVideoEditorStore(state => state.builder.detailsMeta)
  const previusReferences = useVideoEditorStore(state => state.references)
  const saveTo = useVideoEditorStore(state => state.saveTo)
  const initialReference = useVideoEditorStore(state => state.reference)
  const publishingResults = useVideoEditorStore(state => state.publishingResults)
  const getVideo = useVideoEditorStore(state => state.getVideo)
  const updateEditorStatus = useVideoEditorStore(state => state.updateEditorStatus)
  const setPublishingResults = useVideoEditorStore(state => state.setPublishingResults)
  const saveNode = useVideoEditorStore(state => state.saveNode)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const { isLocked } = useWallet()
  const [isSaving, setIsSaving] = useState(false)
  const { addToIndex, addToPlaylist, removeFromIndex, removeFromPlaylist } = useVideoPublish()
  const { showError } = useErrorMessage()

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

  const validateMetadata = useCallback(() => {
    const { duration } = previewMeta
    const { batchId } = detailsMeta!

    if (!duration) {
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
  }, [previewMeta, detailsMeta, showError])

  const uploadManifest = useCallback(async () => {
    if (!checkAccountability()) return

    try {
      const newReference = await saveNode(beeClient)
      return newReference
    } catch (error: any) {
      console.error(error)
      showError("Manifest error", getResponseErrorMessage(error))
      return null
    }
  }, [beeClient, checkAccountability, showError, saveNode])

  const getVideoIndexId = useCallback(
    (indexUrl: string) => {
      return saveTo.find(s => s.source === "index" && s.identifier === indexUrl)!.videoId
    },
    [saveTo]
  )

  const offerVideoResources = useCallback(
    async (references: Reference[]) => {
      try {
        const handler = new EthernaResourcesHandler(references, { gatewayClient })
        await handler.offerResources()
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [gatewayClient]
  )

  const pinVideoResources = useCallback(
    async (references: Reference[]) => {
      try {
        const handler = new EthernaPinningHandler(references, { client: gatewayClient })
        await handler.pinResources()
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [gatewayClient]
  )

  const unpinVideoResources = useCallback(
    async (references: Reference[]) => {
      try {
        // using 'old' video reference to unoffer resources
        const handler = new EthernaPinningHandler(references, { client: gatewayClient })
        await handler.unpinResources()
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [gatewayClient]
  )

  const unofferVideoResources = useCallback(
    async (references: Reference[]) => {
      try {
        // using 'old' video reference to unoffer resources
        const handler = new EthernaResourcesHandler(references, { gatewayClient })
        await handler.unofferResources()
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [gatewayClient]
  )

  const saveVideoTo = useCallback(
    async (saveToSources: VideoEditorPublishSource[], opts: SaveOpts) => {
      const { saveManifest, offerResources, pinResources } = opts

      setIsSaving(true)

      // save manifest
      if (saveManifest && !validateMetadata()) return setIsSaving(false)
      const newReference = opts.saveManifest ? await uploadManifest() : currentReference

      if (!newReference) return setIsSaving(false)

      const referencesToRemove = previusReferences.filter(ref => ref !== newReference)

      // Unoffer previous resources before offering new ones
      if (saveManifest && initialReference) {
        const offered = await unofferVideoResources(referencesToRemove)
        if (!offered) {
          console.error("Coudn't un-offer previous resources")
        }
      }

      // Unpin previous resources before pinning new ones
      if (saveManifest && initialReference) {
        const offered = await unpinVideoResources(referencesToRemove)
        if (!offered) {
          console.error("Coudn't un-offer previous resources")
        }
      }

      // Offer resources
      if (offerResources) {
        const offered = await offerVideoResources([newReference])
        if (!offered) {
          console.error("Coudn't offer resources")
        }
      }

      // Pin resources
      if (pinResources) {
        const pinned = await pinVideoResources([newReference])
        if (!pinned) {
          console.error("Coudn't pin resources")
        }
      }

      console.log(`http://localhost:1633/bzz/${newReference}`)

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

        const newVideo: Video = {
          ...getVideo("http://localhost:1633"),
          reference: newReference,
        }

        if (source.source === "playlist") {
          if (source.add) {
            const ok = await addToPlaylist(initialReference, newVideo, source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "add"
          } else {
            const ok = await removeFromPlaylist(newReference, source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "remove"
          }
        } else if (source.source === "index") {
          const indexReference = getVideoIndexId(source.identifier)
          if (source.add) {
            const ok = await addToIndex(indexReference, newVideo, source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "add"
          } else {
            const ok = await removeFromIndex(indexReference, source.identifier)
            newPublishResults[statusIndex].ok = ok
            newPublishResults[statusIndex].type = "remove"
          }
        }
      }
      setPublishingResults(newPublishResults)

      const hasErrors = newPublishResults.some(ps => !ps.ok)
      updateEditorStatus(hasErrors ? "error" : "saved")
      setIsSaving(false)
    },
    [
      initialReference,
      currentReference,
      publishingResults,
      saveTo,
      previusReferences,
      getVideo,
      pinVideoResources,
      unpinVideoResources,
      validateMetadata,
      uploadManifest,
      setPublishingResults,
      updateEditorStatus,
      unofferVideoResources,
      addToPlaylist,
      removeFromPlaylist,
      getVideoIndexId,
      addToIndex,
      removeFromIndex,
      offerVideoResources,
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
