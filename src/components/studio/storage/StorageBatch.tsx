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

import React, { useCallback, useMemo, useRef, useState } from "react"
import classNames from "classnames"

import classes from "@/styles/components/studio/storage/StorageBatch.module.scss"
import { CogIcon } from "@heroicons/react/outline"

import StorageBatchEditor from "./StorageBatchEditor"
import Modal from "@/components/common/Modal"
import Button from "@/components/common/Button"
import ProgressBar from "@/components/common/ProgressBar"
import { convertBytes } from "@/utils/converters"
import dayjs from "@/utils/dayjs"
import { clamp } from "@/utils/math"
import { getBatchSpace } from "@/utils/batches"
import type { GatewayBatch } from "@/definitions/api-gateway"
import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import useSelector from "@/state/useSelector"
import AlertPopup from "@/components/common/AlertPopup"

type StorageBatchProps = {
  batch: GatewayBatch
  num: number
  isMain?: boolean
}

const StorageBatch: React.FC<StorageBatchProps> = ({ batch, num, isMain }) => {
  const address = useSelector(state => state.user.address)
  const gatewayClient = useSelector(state => state.env.gatewayClient)
  const beeClient = useSelector(state => state.env.beeClient)
  const gatewayType = useSelector(state => state.env.gatewayType)
  const [editorDepth, setEditorDepth] = useState(batch.depth)
  const [editorAmount, setEditorAmount] = useState<string | undefined>()
  const [showEditor, setShowEditor] = useState(false)
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false)
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false)
  const batchesManager = useRef(new SwarmBatchesManager({
    address: address!,
    beeClient,
    gatewayClient,
    gatewayType,
  }))

  const [totalSpace, usedSpace, availableSpace, usagePercent] = useMemo(() => {
    const { available, total, used } = getBatchSpace(batch)
    const usagePercent = clamp(used / total * 100, 0.5, 100)
    return [total, used, available, usagePercent]
  }, [batch])

  const expiration = useMemo(() => {
    if (batch.batchTTL === -1 && batch.usable) return "never"
    if (batch.batchTTL === -1 && !batch.usable) return "expired"
    const expirationDate = dayjs.duration({ seconds: batch.batchTTL }).humanize()
    return expirationDate.startsWith("NaN") ? "never" : expirationDate
  }, [batch])

  const batchName = useMemo(() => {
    return isMain ? "Default postage batch" : batch.label || `Postage batch ${num}`
  }, [batch, isMain, num])

  const updateBatch = useCallback(async () => {
    const batchManager = batchesManager.current

    if (editorDepth > batch.depth) {
      await batchManager.diluteBatch(batch.id, editorDepth)
    }
    if (editorAmount) {
      await batchManager.topupBatch(batch.id, editorAmount)
    }

    setShowUpdateSuccess(true)
  }, [batch, editorAmount, editorDepth])

  return (
    <>
      <li className={classes.storageBatch}>
        <header className={classes.storageBatchHeader}>
          <h3 className={classes.storageBatchTitle}>
            {batchName}
          </h3>
          <span className={classes.storageBatchSize}>
            {convertBytes(totalSpace).readable}
          </span>
          <Button
            className={classes.storageBatchSettings}
            aspect="link"
            modifier="muted"
            onClick={() => setShowEditor(true)}
          >
            <CogIcon />
          </Button>
        </header>

        {isMain && (
          <small className="block mb-3">The default postage batch is used for channel information.</small>
        )}

        <span>
          Expiring
          <span className={classes.storageBatchExpiring}>
            {expiration}
          </span>
          <small className="block">The ability to expand and renew the storage will be added soon.</small>
        </span>

        <div className="mt-5">
          <h4 className={classes.storageBatchSubtitle}>Space utilization</h4>
          <ProgressBar
            className={classNames(classes.storageBatchProgress, {
              [classes.warning]: usagePercent >= 80,
              [classes.danger]: usagePercent >= 95,
            })}
            progress={usagePercent}
          />
          <dl className={classes.storageBatchDataList}>
            <dt>Used</dt>
            <dd>{convertBytes(usedSpace, 3).readable}</dd>
            <dt>Available</dt>
            <dd>{convertBytes(availableSpace, 3).readable}</dd>
          </dl>
        </div>
      </li>

      <Modal
        show={showEditor}
        title={batchName}
        footerButtons={
          <>
            <Button loading={isUpdatingBatch} onClick={updateBatch}>
              Save
            </Button>
            <Button modifier="muted" onClick={() => setShowEditor(false)} disabled={isUpdatingBatch}>
              Cancel
            </Button>
          </>
        }
      >
        <StorageBatchEditor
          batch={batch}
          batchesManager={batchesManager.current}
          onChange={(depth, amount) => {
            setEditorDepth(depth)
            setEditorAmount(amount)
          }}
        />
      </Modal>

      <AlertPopup
        show={showUpdateSuccess}
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

export default StorageBatch
