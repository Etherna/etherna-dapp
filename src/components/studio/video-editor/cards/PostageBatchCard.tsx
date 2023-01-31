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
 *
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BatchesHandler } from "@etherna/api-js/handlers"
import { BatchUpdateType } from "@etherna/api-js/stores"
import { Transition } from "@headlessui/react"

import BatchLoading from "@/components/common/BatchLoading"
import { Card } from "@/components/ui/display"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import useVideoEditorStore from "@/stores/video-editor"

import type { BatchId, PostageBatch } from "@etherna/api-js/clients"

type PostageBatchCardProps = {
  disabled?: boolean
}

const PostageBatchCard: React.FC<PostageBatchCardProps> = ({ disabled }) => {
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const address = useUserStore(state => state.address)
  const editorStatus = useVideoEditorStore(state => state.status)
  const queue = useVideoEditorStore(state => state.queue)
  const duration = useVideoEditorStore(state => state.builder.previewMeta.duration)
  const videoSources = useVideoEditorStore(state => state.builder.detailsMeta.sources)
  const batchId = useVideoEditorStore(state => state.builder.detailsMeta.batchId)
  const batchStatus = useVideoEditorStore(state => state.batchStatus)
  const setBatchStatus = useVideoEditorStore(state => state.updateBatchStatus)
  const setBatchId = useVideoEditorStore(state => state.setBatchId)
  const [batch, setBatch] = useState<PostageBatch>()
  const [missing, setMissing] = useState<boolean>(false)
  const [errored, setErrored] = useState<boolean>(false)
  const batchesHandler = useRef(
    new BatchesHandler({
      address: address!,
      beeClient,
      gatewayClient,
      gatewayType,
      network: import.meta.env.DEV ? "testnet" : "mainnet",
    })
  )

  const show = useMemo(() => {
    return batchStatus !== undefined || missing
  }, [batchStatus, missing])

  const initialVideoQueue = useMemo(() => {
    if (videoSources.length > 0) return null
    const first = queue[0]
    if (first && first.name !== "0p" && first.size) {
      return first
    }
    return null
  }, [queue, videoSources])

  const title = useMemo(() => {
    if (missing) return "Missing postage batch"
    if (batchStatus === "creating") return "Creating a postage batch for your video"
    if (batchStatus === "fetching") return "Loading your video postage batch"
    // fallback to default
    return undefined
  }, [batchStatus, missing])

  const message = useMemo(() => {
    if (missing) return "This video doesn't have a postage batch. Create a new one."
    if (batchStatus === "creating")
      return (
        "Please wait while we create your postage batch." +
        `\n` +
        `Postage batches are used to distribute your video to the swarm network.`
      )
    if (batchStatus === "fetching") return "Please wait while we load your postage batch."
    if (batchStatus === "not-found") return ""
    // fallback to default
    return undefined
  }, [batchStatus, missing])

  const createNewBatch = useCallback(async () => {
    if (editorStatus === "creating" && !initialVideoQueue) return

    const batchSize =
      editorStatus === "creating"
        ? batchesHandler.current.calcBatchSizeForVideo(
            initialVideoQueue!.size!,
            parseInt(initialVideoQueue!.name)
          )
        : batchesHandler.current.calcBatchSizeForVideoSources(videoSources, duration)

    setMissing(false)
    setErrored(false)
    setBatchStatus("creating")

    let batch = await batchesHandler.current.createBatchForSize(batchSize)
    setBatchId(batchesHandler.current.getBatchId(batch))
    setBatchStatus("propagation")

    try {
      batch = await batchesHandler.current.waitBatchPropagation(batch, BatchUpdateType.Create)

      setBatch(batchesHandler.current.parseBatch(batch))
      setBatchStatus(undefined)
    } catch (error) {
      console.error(error)
      setErrored(true)
    }
  }, [editorStatus, initialVideoQueue, videoSources, duration, setBatchStatus, setBatchId])

  const fetchBatch = useCallback(async () => {
    setBatchStatus("fetching")
    setErrored(false)
    setMissing(false)

    batchesHandler.current.onBatchesLoaded = ([batch]) => {
      if (batch) {
        setBatch(batchesHandler.current.parseBatch(batch))
        setBatchStatus(undefined)
      } else {
        setBatchStatus("not-found")
      }
    }
    batchesHandler.current.onBatchLoadError = () => {
      setBatchStatus("not-found")
    }
    batchesHandler.current.loadBatches([batchId as BatchId])

    setMissing(false)
  }, [batchId, setBatchStatus])

  const upgradeBatch = useCallback(async () => {
    if (!batch) return

    setErrored(false)
    setMissing(false)

    const extraSpace = queue
      .filter(q => q.type === "upload" && !q.completion)
      .reduce((sum, q) => sum + (q.size ?? 0), 2 ** 20 * 1 /* 1mb extra */)

    setBatchStatus("propagation")

    try {
      await batchesHandler.current.increaseBatchSize(batch, extraSpace)
      const batchUpdate = await batchesHandler.current.waitBatchPropagation(
        batch,
        BatchUpdateType.Topup
      )
      setBatch(batchesHandler.current.parseBatch(batchUpdate))
    } catch (error) {
      console.error(error)
      setErrored(true)
    }
  }, [batch, queue, setBatchStatus])

  useEffect(() => {
    if (
      !batchId &&
      initialVideoQueue?.completion === null &&
      editorStatus === "creating" &&
      videoSources.length === 0
    ) {
      createNewBatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVideoQueue])

  useEffect(() => {
    if (batchId && editorStatus === "editing") {
      fetchBatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const missing = !batchId && editorStatus === "editing" && batchStatus === undefined
    setMissing(missing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, batchStatus])

  useEffect(() => {
    if (batchStatus === "saturated") {
      upgradeBatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchStatus])

  return (
    <Transition
      as="div"
      show={show}
      enter="transition-[max-height] duration-500 overflow-hidden"
      enterFrom="max-h-0"
      enterTo="max-h-[20rem]"
      leave="transition-[max-height] duration-500 overflow-hidden"
      leaveFrom="max-h-[20rem]"
      leaveTo="max-h-0"
    >
      <Card title="Postage batch">
        <BatchLoading
          type={batchStatus ?? "fetching"}
          title={title}
          message={message}
          error={batchStatus === "not-found" || missing}
          onCreate={createNewBatch}
        />
      </Card>
    </Transition>
  )
}

export default PostageBatchCard
