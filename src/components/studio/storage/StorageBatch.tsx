import React, { useMemo } from "react"
import classNames from "classnames"

import classes from "@styles/components/studio/storage/StorageBatch.module.scss"

import ProgressBar from "@common/ProgressBar"
import { convertBytes } from "@utils/converters"
import dayjs from "@utils/dayjs"
import type { GatewayBatch } from "@definitions/api-gateway"
import { clamp } from "@utils/math"

type StorageBatchProps = {
  batch: GatewayBatch
  num: number
}

const StorageBatch: React.FC<StorageBatchProps> = ({ batch, num }) => {
  const [totalSpace, usedSpace, availableSpace, usagePercent] = useMemo(() => {
    const { utilization, depth, bucketDepth } = batch
    const usage = utilization / 2 ** (depth - bucketDepth)
    const total = 2 ** depth * 4096
    const used = total * usage
    const available = total - used
    const usagePercent = clamp(usage * 100, 0.5, 100)
    return [total, used, available, usagePercent]
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
          {batch.batchTTL === -1 ? "never" : `${dayjs.duration({ seconds: batch.batchTTL }).humanize(true)}`}
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