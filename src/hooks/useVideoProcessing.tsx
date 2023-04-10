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
import { useEffect, useRef } from "react"
import { calcBatchPrice, getBatchCapacity } from "@etherna/api-js/utils"

import useConfirmation from "./useConfirmation"
import useErrorMessage from "./useErrorMessage"
import VideoProcessingController, {
  BatchNotFoundError,
  BatchRejectError,
} from "@/classes/VideoProcessingController"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useVideoEditorStore from "@/stores/video-editor"
import { convertBytes } from "@/utils/converters"

import type { Reference } from "@etherna/api-js/clients"

// controller instance should be global to avoid duplicate events
export let videoProcessingController = new VideoProcessingController("0".repeat(64) as Reference)

export default function useVideoProcessing() {
  const abortController = useRef<AbortController>()
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const reference = useVideoEditorStore(state => state.reference)
  const inputFile = useVideoEditorStore(state => state.inputFile)
  const encodingStatus = useVideoEditorStore(state => state.encoding.status)
  const uploadStatus = useVideoEditorStore(state => state.upload.status)
  const batchStatus = useVideoEditorStore(state => state.batch.status)
  const batch = useVideoEditorStore(state => state.batch.batch)
  const batchId = useVideoEditorStore(state => state.batch.batchId)

  const addAdaptiveSource = useVideoEditorStore(state => state.addVideoAdaptiveSource)
  const setBatch = useVideoEditorStore(state => state.setBatch)
  const updateBatchStatus = useVideoEditorStore(state => state.updateBatchStatus)
  const updateEncodeStatus = useVideoEditorStore(state => state.updateEncodeStatus)
  const updateUploadStatus = useVideoEditorStore(state => state.updateUploadStatus)
  const updateAspectRatio = useVideoEditorStore(state => state.updateAspectRatio)
  const updateDuration = useVideoEditorStore(state => state.updateDuration)

  const { waitConfirmation } = useConfirmation()
  const { showError } = useErrorMessage()

  useEffect(() => {
    // TODO: add event for tab closing while encode/upload is in progress
    window.onbeforeunload = () => {
      if (uploadStatus === "progress") {
        return "Your upload is still in progress. Are you sure you want to leave?"
      }

      if (encodingStatus === "progress") {
        return "Your video is still being encoded. Are you sure you want to leave?"
      }

      if (batchStatus !== undefined) {
        return "Your postage batch is still loading. Are you sure you want to leave?"
      }
    }

    if (reference !== videoProcessingController.reference) {
      videoProcessingController.stopEncoding()
      videoProcessingController.stopUpload()
      videoProcessingController.stopBatchOperations()

      videoProcessingController = new VideoProcessingController(reference)

      videoProcessingController.onDecodedDuration = duration => {
        updateDuration(duration)
      }
      videoProcessingController.onDecodedAspectRatio = aspectRatio => {
        updateAspectRatio(aspectRatio)
      }
      videoProcessingController.onEncodingStart = () => {
        updateEncodeStatus("loading")
      }
      videoProcessingController.onEncodingProgress = progress => {
        updateEncodeStatus("progress", progress)
      }
      videoProcessingController.onEncodingComplete = () => {
        updateEncodeStatus("done", 100)
      }
      videoProcessingController.onEncodingError = error => {
        console.error(error)
        updateEncodeStatus("error", undefined)
      }

      videoProcessingController.onBatchCreating = () => {
        updateBatchStatus("creating")
      }
      videoProcessingController.onBatchUpdating = () => {
        updateBatchStatus("updating")
      }
      videoProcessingController.onBatchPayingRequest = async (depth, amount) => {
        return await waitConfirmation(
          "A postage batch transaction is needed",
          `To create/update a postage batch, a transaction is needed. The transaction will cost ${calcBatchPrice(
            depth,
            amount
          )} for a batch of size ~${convertBytes(getBatchCapacity(depth)).readable}.`,
          "Proceed"
        )
      }
      videoProcessingController.onBatchCreated = batchId => {
        setBatch(batchId)
      }
      videoProcessingController.onBatchLoading = () => {
        updateBatchStatus("fetching")
      }
      videoProcessingController.onBatchLoaded = batch => {
        updateBatchStatus(undefined)
        setBatch(batch.batchID, batch)
      }
      videoProcessingController.onBatchWaiting = () => {
        updateBatchStatus("propagation")
      }
      videoProcessingController.onBatchError = error => {
        console.error(error)
        if (error instanceof BatchNotFoundError) {
          updateBatchStatus("not-found")
        }
        if (error instanceof BatchRejectError) {
          updateBatchStatus("rejected")
        } else {
          showError("An uknown error has occured. Please try again later.")
        }
      }

      videoProcessingController.onUploadStart = () => {
        updateUploadStatus("progress", 0)
      }
      videoProcessingController.onUploadProgress = progress => {
        updateUploadStatus("progress", progress)
      }
      videoProcessingController.onFileUploaded = async (path, data, reference) => {
        const type = path.startsWith("dash") ? "dash" : "hls"
        // remove ffmpeg folder prefix
        const fileName = path.replace(/(dash|hls)\//, "")

        // if source manifest, find relative video size
        const isMediaManifest = VideoProcessingController.MediaManifestNameRegex.test(fileName)
        const size = isMediaManifest ? videoProcessingController.mediaSizeFromName(fileName) : 0

        await addAdaptiveSource(type, data, fileName, size)
      }
      videoProcessingController.onUploadComplete = () => {
        updateUploadStatus("done", 100)
      }
      videoProcessingController.onUploadError = error => {
        console.error(error)
        updateUploadStatus("error")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference])

  useEffect(() => {
    if (inputFile && encodingStatus === "idle") {
      videoProcessingController.startEncoding(inputFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputFile])

  useEffect(() => {
    if (encodingStatus === "done") {
      videoProcessingController.startBatchLoading(beeClient, gatewayClient, gatewayType, batchId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodingStatus])

  useEffect(() => {
    if (
      encodingStatus === "done" &&
      batchStatus === undefined &&
      batch &&
      uploadStatus === "idle"
    ) {
      abortController.current = new AbortController()
      videoProcessingController.startUpload(beeClient, abortController.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodingStatus, batchStatus, uploadStatus])
}
