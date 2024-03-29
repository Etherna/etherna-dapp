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

import React, { useCallback, useEffect, useRef, useState } from "react"
import { BatchesHandler } from "@etherna/sdk-js/handlers"
import { batchesStore, BatchUpdateType } from "@etherna/sdk-js/stores"
import { getBatchPercentUtilization, getBatchSpace, parsePostageBatch } from "@etherna/sdk-js/utils"
import { useStore } from "zustand"

import { CogIcon } from "@heroicons/react/24/outline"
import { CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/solid"

import PostageBatchEditor from "./PostageBatchEditor"
import { AlertPopup, Button, Modal } from "@/components/ui/actions"
import { Capacity, FormGroup, Table } from "@/components/ui/display"
import { Select } from "@/components/ui/inputs"
import useErrorMessage from "@/hooks/useErrorMessage"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"
import { convertBytes } from "@/utils/converters"
import dayjs from "@/utils/dayjs"

import type { GatewayBatch } from "@etherna/sdk-js/clients"
import type { BatchesState } from "@etherna/sdk-js/stores"

const useBatchesStore = <U,>(selector: (state: BatchesState) => U) =>
  useStore(batchesStore, selector)

type PostageBatchListProps = {
  page: number
  perPage: number
  total: number
  batches: GatewayBatch[]
  isLoading?: boolean
  onBatchUpdate?(batch: GatewayBatch): void
  onPageChange?(page: number, perPage?: number): void
}

const PostageBatchList: React.FC<PostageBatchListProps> = ({
  page,
  perPage,
  total,
  batches,
  isLoading,
  onBatchUpdate,
  onPageChange,
}) => {
  const updatingBatches = useBatchesStore(state => state.updatingBatches)
  const addBatchUpdate = useBatchesStore(state => state.addBatchUpdate)
  const removeBatchUpdate = useBatchesStore(state => state.removeBatchUpdate)
  const getBatchNumber = useUserStore(state => state.getBatchNumber)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const [editingBatch, setEditingBatch] = useState<GatewayBatch>()
  const [showBatchEditor, setShowBatchEditor] = useState(false)
  const [editorDepth, setEditorDepth] = useState<number>()
  const [editorAmount, setEditorAmount] = useState<string | undefined>()
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired">("active")
  const [status, setStatus] = useState<"dilute-request" | "dilute-propagation" | "topup-request">()
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false)
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false)
  const { showError } = useErrorMessage()
  const batchesManager = useRef(
    new BatchesHandler({
      beeClient,
      gatewayClient,
      gatewayType,
      network: import.meta.env.DEV ? "testnet" : "mainnet",
    })
  )

  useEffect(() => {
    onPageChange?.(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    waitBatchesUpdate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatingBatches, isUpdatingBatch])

  const waitBatchesUpdate = useCallback(async () => {
    if (isUpdatingBatch) return
    if (!updatingBatches || updatingBatches?.length === 0) return

    const selectedBatch = updatingBatches[0]

    const batch = await batchesManager.current.waitBatchPropagation(
      selectedBatch,
      selectedBatch.flag
    )
    const gatewayBatch = "batchID" in batch ? parsePostageBatch(batch) : batch

    onBatchUpdate?.(gatewayBatch)
  }, [updatingBatches, isUpdatingBatch, onBatchUpdate])

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

    try {
      if (dilute) {
        addBatchUpdate(editingBatch!, BatchUpdateType.Dilute)
        setStatus("dilute-request")
        await batchManager.diluteBatch(editingBatch!.id, editorDepth)
      }
      if (dilute && topup) {
        setStatus("dilute-propagation")
        await batchManager.waitBatchPropagation(editingBatch!, BatchUpdateType.Dilute)
        removeBatchUpdate(editingBatch!.id)
      }
      if (topup) {
        setStatus("topup-request")
        addBatchUpdate(editingBatch!, BatchUpdateType.Topup)
        await batchManager.topupBatch(editingBatch!.id, editorAmount)
      }

      setShowUpdateSuccess(true)
      setShowBatchEditor(false)
    } catch (error: any) {
      showError("Error updating batch", error.message)

      removeBatchUpdate(editingBatch!.id)
    } finally {
      setStatus(undefined)
      setIsUpdatingBatch(false)
    }
  }, [editorDepth, editingBatch, editorAmount, addBatchUpdate, showError, removeBatchUpdate])

  const getBatchName = useCallback(
    (batch: GatewayBatch | undefined, i: number) => {
      return batch?.id === defaultBatchId
        ? "Default postage batch"
        : batch?.label || `Postage batch ${i + 1}`
    },
    [defaultBatchId]
  )

  const getBatchExpiration = useCallback((batch: GatewayBatch) => {
    let expiration = ""
    if (batch.batchTTL === -1 && batch.usable) {
      expiration = "never"
    } else if (batch.batchTTL === -1 && !batch.usable) {
      expiration = "expired"
    } else {
      const expirationTime = dayjs.duration({ seconds: batch.batchTTL })
      const expireInDays = expirationTime.asDays()
      if (expireInDays < 0) {
        expiration = "never"
      } else if (expireInDays < 365) {
        expiration = expirationTime.humanize()
      } else {
        expiration = `${+(expireInDays / 365).toFixed(1)} years`
      }
    }
    return expiration
  }, [])

  const isBatchExpired = useCallback((batch: GatewayBatch) => {
    const isExpired = batch.batchTTL === -1 && !batch.usable
    return isExpired
  }, [])

  const isBatchNotFound = useCallback((batch: GatewayBatch) => {
    return !batch.exists && batch.depth === 0
  }, [])

  return (
    <>
      <FormGroup>
        <Select
          label="Show: "
          value={filter}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "expiring", label: "Expiring soon (31 days)" },
            { value: "expired", label: "Expired" },
          ]}
          onChange={filter => setFilter(filter as any)}
        />
      </FormGroup>

      <Table
        page={page}
        total={total}
        itemsPerPage={perPage}
        items={batches}
        isLoading={isLoading}
        columns={[
          {
            title: "Name",
            width: "1fr",
            render: batch => (
              <div className="">
                <p className="leading-none">{getBatchName(batch, getBatchNumber(batch.id))}</p>
                <small
                  className={cn(
                    "mt-1 inline-block w-40 overflow-hidden xl:w-auto",
                    "truncate text-xs leading-none text-gray-600 dark:text-gray-400"
                  )}
                >
                  {batch.id}
                </small>
              </div>
            ),
          },
          {
            title: "Expiration",
            width: "110px",
            render: batch => {
              const expiration = getBatchExpiration(batch)
              const isExpired = isBatchExpired(batch)
              const notFound = isBatchNotFound(batch)
              return (
                <span className={cn("text-sm", { "text-red-500": isExpired })}>
                  {notFound ? "not found" : expiration}
                </span>
              )
            },
          },
          {
            title: "Capacity",
            width: "240px",
            render: batch => {
              const { total, used } = getBatchSpace(batch)

              if (isBatchNotFound(batch)) return null

              return (
                <div className="flex items-center">
                  <Capacity
                    value={getBatchPercentUtilization(batch)}
                    limit={1}
                    isLoading={!!updatingBatches.find(b => b.id === batch.id)}
                  />

                  <p className="ml-2 shrink-0 font-mono text-xs font-medium">
                    <span>{convertBytes(used).readable}</span>
                    <span> / </span>
                    <span>{convertBytes(total).readable}</span>
                  </p>
                </div>
              )
            },
          },
          {
            title: "",
            width: "60px",
            render: batch => (
              <>
                {!updatingBatches.find(b => b.id === batch.id) && !isBatchExpired(batch) && (
                  <Button color="transparent" onClick={() => openSettings(batch)}>
                    <CogIcon width={18} aria-hidden />
                  </Button>
                )}
              </>
            ),
          },
        ]}
        onPageChange={onPageChange}
      />

      <Modal
        show={showBatchEditor}
        title={getBatchName(editingBatch, batches.indexOf(editingBatch!))}
        footerButtons={
          <>
            <Button loading={isUpdatingBatch} onClick={updateBatch}>
              Save
            </Button>
            <Button
              color="muted"
              onClick={() => setShowBatchEditor(false)}
              disabled={isUpdatingBatch}
            >
              Cancel
            </Button>
          </>
        }
      >
        {editingBatch && (
          <>
            <PostageBatchEditor
              batch={editingBatch}
              batchesManager={batchesManager.current}
              gatewayType={gatewayType}
              onChange={(depth, amount) => {
                setEditorDepth(depth)
                setEditorAmount(amount)
              }}
            />

            {status && (
              <div className="mt-3">
                <small
                  className={cn(
                    "flex items-center text-sm leading-none text-gray-900 dark:text-gray-100"
                  )}
                >
                  <InformationCircleIcon width={16} className="mr-2" aria-hidden />
                  {status === "dilute-request" &&
                    "Sendind request to increase postage batch capacity..."}
                  {status === "dilute-propagation" &&
                    "Waiting batch propagation. (This process may take a few minutes)"}
                  {status === "topup-request" &&
                    "Sending request to increase postage batch duration..."}
                </small>
              </div>
            )}
          </>
        )}
      </Modal>

      <AlertPopup
        show={showUpdateSuccess}
        icon={<CheckCircleIcon className="text-green-500" />}
        title="Batch updated!"
        message="Now it might take a few minutes for the changes to take effect."
        actions={[
          {
            title: "OK",
            type: "default",
            action() {
              setShowUpdateSuccess(false)
            },
          },
        ]}
      />
    </>
  )
}

export default PostageBatchList
