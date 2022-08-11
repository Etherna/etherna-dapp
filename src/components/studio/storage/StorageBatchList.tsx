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

import classes from "@/styles/components/studio/storage/StorageBatchList.module.scss"
import { BadgeCheckIcon } from "@heroicons/react/solid"

import StorageBatch from "./StorageBatch"
import StorageBatchEditor from "./StorageBatchEditor"
import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import AlertPopup from "@/components/common/AlertPopup"
import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import useLocalStorage from "@/hooks/useLocalStorage"
import useSelector from "@/state/useSelector"
import { useErrorMessage } from "@/state/hooks/ui"
import useBatchesStore, { BatchUpdateType } from "@/stores/batches"
import { parsePostageBatch } from "@/utils/batches"
import type { GatewayBatch } from "@/definitions/api-gateway"
import FlagEnumManager from "@/classes/FlagEnumManager"

type StorageBatchListProps = {
  batches: GatewayBatch[]
  onBatchUpdate?(batch: GatewayBatch): void
}

const StorageBatchList: React.FC<StorageBatchListProps> = ({ batches, onBatchUpdate }) => {
  const updatingBatches = useBatchesStore(state => state.updatingBatches)
  const addBatchUpdate = useBatchesStore(state => state.addBatchUpdate)
  const removeBatchUpdate = useBatchesStore(state => state.removeBatchUpdate)
  const defaultBatchId = useSelector(state => state.user.defaultBatchId)
  const address = useSelector(state => state.user.address)
  const gatewayClient = useSelector(state => state.env.gatewayClient)
  const beeClient = useSelector(state => state.env.beeClient)
  const gatewayType = useSelector(state => state.env.gatewayType)
  const [editingBatch, setEditingBatch] = useState<GatewayBatch>()
  const [showBatchEditor, setShowBatchEditor] = useState(false)
  const [editorDepth, setEditorDepth] = useState<number>()
  const [editorAmount, setEditorAmount] = useState<string | undefined>()
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false)
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false)
  const { showError } = useErrorMessage()
  const batchesManager = useRef(new SwarmBatchesManager({
    address: address!,
    beeClient,
    gatewayClient,
    gatewayType,
  }))

  useEffect(() => {
    waitBatchesUpdate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatingBatches, isUpdatingBatch])

  const waitBatchesUpdate = useCallback(async () => {
    if (isUpdatingBatch) return
    if (!updatingBatches || updatingBatches?.length === 0) return

    const selectedBatch = updatingBatches[0]

    const batch = await batchesManager.current.waitBatchPropagation(selectedBatch, selectedBatch.flag)
    const gatewayBatch = "batchID" in batch ? parsePostageBatch(batch, address) : batch

    onBatchUpdate?.(gatewayBatch)
  }, [address, updatingBatches, isUpdatingBatch, onBatchUpdate])

  const openSettings = useCallback((batch: GatewayBatch) => {
    setEditorDepth(batch.depth)
    setEditorAmount(batch.amount)
    setEditingBatch(batch)
    setTimeout(() => {
      setShowBatchEditor(true)
    }, 50)
  }, [])

  const updateBatch = useCallback(async () => {
    setIsUpdatingBatch(true)

    const batchManager = batchesManager.current

    const dilute = editorDepth && editorDepth > editingBatch!.depth
    const topup = editorAmount && BigInt(editorAmount) > BigInt(0)

    const flag = new FlagEnumManager()
    dilute && flag.add(BatchUpdateType.Dilute)
    topup && flag.add(BatchUpdateType.Topup)

    addBatchUpdate(editingBatch!, flag.get())

    try {
      if (dilute) {
        await batchManager.diluteBatch(editingBatch!.id, editorDepth)
      }
      if (topup) {
        await batchManager.topupBatch(editingBatch!.id, editorAmount)
      }

      setShowUpdateSuccess(true)
      setShowBatchEditor(false)
    } catch (error: any) {
      showError("Error updating batch", error.message)

      removeBatchUpdate(editingBatch!.id)
    }

    setIsUpdatingBatch(false)
  }, [editorDepth, editingBatch, editorAmount, addBatchUpdate, showError, removeBatchUpdate])

  const getBatchName = useCallback((batch: GatewayBatch | undefined, i: number) => {
    return batch?.id === defaultBatchId
      ? "Default postage batch"
      : batch?.label || `Postage batch ${i + 1}`
  }, [defaultBatchId])

  return (
    <>
      <ul className={classes.storageList}>
        {batches.map((batch, i) => (
          <StorageBatch
            batch={batch}
            title={getBatchName(batch, i)}
            isMain={batch.id === defaultBatchId}
            isUpdating={!!updatingBatches?.find(b => b.id === batch.id)}
            onSettingsClick={() => openSettings(batch)}
            key={batch.id}
          />
        ))}
      </ul>

      <Modal
        show={showBatchEditor}
        title={getBatchName(editingBatch, batches.indexOf(editingBatch!))}
        footerButtons={
          <>
            <Button loading={isUpdatingBatch} onClick={updateBatch}>
              Save
            </Button>
            <Button modifier="muted" onClick={() => setShowBatchEditor(false)} disabled={isUpdatingBatch}>
              Cancel
            </Button>
          </>
        }
      >
        {editingBatch && (
          <StorageBatchEditor
            batch={editingBatch}
            batchesManager={batchesManager.current}
            gatewayType={gatewayType}
            onChange={(depth, amount) => {
              setEditorDepth(depth)
              setEditorAmount(amount)
            }}
          />
        )}
      </Modal>

      <AlertPopup
        show={showUpdateSuccess}
        icon={<BadgeCheckIcon />}
        title="Batch updated!"
        message="Now it might take a few minutes for the changes to take effect."
        actions={[{
          title: "OK",
          type: "cancel",
          action() {
            setShowUpdateSuccess(false)
          },
        }]}
      />
    </>
  )
}

export default StorageBatchList
