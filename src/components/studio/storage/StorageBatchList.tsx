import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import classes from "@/styles/components/studio/storage/StorageBatchList.module.scss"

import StorageBatch from "./StorageBatch"
import StorageBatchEditor from "./StorageBatchEditor"
import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import AlertPopup from "@/components/common/AlertPopup"
import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import useSelector from "@/state/useSelector"
import useLocalStorage from "@/hooks/useLocalStorage"
import { parsePostageBatch } from "@/utils/batches"
import type { GatewayBatch } from "@/definitions/api-gateway"
import { BadgeCheckIcon } from "@heroicons/react/solid"

type StorageBatchListProps = {
  batches: GatewayBatch[]
  onBatchUpdate?(batch: GatewayBatch): void
}

const StorageBatchList: React.FC<StorageBatchListProps> = ({ batches, onBatchUpdate }) => {
  const [updatingBatches, setUpdatingBatches] = useLocalStorage<Partial<GatewayBatch>[]>("updatingBatches", [])
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

    const batch = await batchesManager.current.waitBatchPropagation(selectedBatch as GatewayBatch)

    const index = updatingBatches.indexOf(selectedBatch)
    updatingBatches.splice(index, 1)
    setUpdatingBatches([...updatingBatches])

    const gatewayBatch = "batchID" in batch ? parsePostageBatch(batch, address) : batch

    onBatchUpdate?.(gatewayBatch)
  }, [address, updatingBatches, isUpdatingBatch, onBatchUpdate, setUpdatingBatches])

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

    setUpdatingBatches([
      ...(updatingBatches ?? []), {
        id: editingBatch!.id,
        depth: editorDepth!,
        amount: editorAmount!,
      }
    ])

    if (editorDepth && editorDepth > editingBatch!.depth) {
      await batchManager.diluteBatch(editingBatch!.id, editorDepth)
    }
    if (editorAmount) {
      await batchManager.topupBatch(editingBatch!.id, editorAmount)
    }

    setIsUpdatingBatch(false)
    setShowUpdateSuccess(true)
    setShowBatchEditor(false)
  }, [editingBatch, editorAmount, editorDepth, updatingBatches, setUpdatingBatches])

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
