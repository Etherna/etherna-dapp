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

import React, { useMemo } from "react"
import classNames from "classnames"

import classes from "@/styles/components/studio/storage/StorageBatch.module.scss"

import ProgressBar from "@/components/common/ProgressBar"
import { convertBytes } from "@/utils/converters"
import dayjs from "@/utils/dayjs"
import { clamp } from "@/utils/math"
import { getBatchSpace } from "@/utils/batches"
import type { GatewayBatch } from "@/definitions/api-gateway"

type StorageBatchProps = {
  batch: GatewayBatch
  num: number
}

const StorageBatch: React.FC<StorageBatchProps> = ({ batch, num }) => {
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

  return (
    <li className={classes.storageBatch}>
      <header className={classes.storageBatchHeader}>
        <h3 className={classes.storageBatchTitle}>
          {batch.label || `Storage ${num}`}
        </h3>
        <span className={classes.storageBatchSize}>
          {convertBytes(totalSpace).readable}
        </span>
      </header>

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
  )
}

export default StorageBatch
