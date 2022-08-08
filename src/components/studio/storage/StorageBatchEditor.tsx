import React, { useCallback, useEffect, useRef, useState } from "react"

import classes from "@/styles/components/studio/storage/StorageBatchEditor.module.scss"

import type { GatewayBatch } from "@/definitions/api-gateway"
import Slider from "@/components/common/Slider"
import dayjs from "@/utils/dayjs"
import { calcDilutedTTL, getBatchCapacity, getBatchSpace, getPrice, ttlToAmount } from "@/utils/batches"
import { convertBytes } from "@/utils/converters"
import { clamp } from "@/utils/math"
import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import Spinner from "@/components/common/Spinner"
import FormGroup from "@/components/common/FormGroup"

type StorageBatchEditorProps = {
  batch: GatewayBatch
  batchesManager: SwarmBatchesManager
  onChange(depth: number, amount: string | undefined): void
}

const StorageBatchEditor: React.FC<StorageBatchEditorProps> = ({ batch, batchesManager, onChange }) => {
  const [depth, setDepth] = useState(batch.depth)
  const [ttl, setTtl] = useState(batch.batchTTL)
  const [amount, setAmount] = useState("")
  const [currentPrice, setcurrentPrice] = useState<number>()

  useEffect(() => {
    batchesManager.fetchPrice().then(setcurrentPrice)
  }, [batchesManager])

  const onDepthChange = useCallback((depth: number) => {
    const newTTL = calcDilutedTTL(batch.batchTTL, batch.depth, depth)
    const newAmount = ttlToAmount(ttl, currentPrice!, batchesManager.defaultBlockTime).toString()
    setDepth(depth)
    setTtl(newTTL)
    setAmount(newAmount)
    onChange(depth, newAmount)
  }, [batch, batchesManager, currentPrice, ttl, onChange])

  const onTTLChange = useCallback((seconds: number) => {
    const ttlDiff = clamp(seconds - batch.batchTTL, 0, Math.max(seconds, batch.batchTTL))
    const newAmount = ttlToAmount(ttlDiff, currentPrice!, batchesManager.defaultBlockTime).toString()
    setTtl(batch.batchTTL + ttlDiff)
    setAmount(newAmount)
    onChange(depth, newAmount)
  }, [batch, batchesManager, currentPrice, depth, onChange])

  if (!currentPrice) return (
    <div className="m-auto p-8">
      <Spinner />
    </div>
  )

  console.log(depth, ttl, amount)

  return (
    <div>
      <FormGroup label="Size:">
        <Slider
          className={classes.batchEditorSlider}
          min={batch.depth}
          max={50}
          step={1}
          onChange={onDepthChange}
        />
        <small className="font-mono">{convertBytes(getBatchCapacity(depth)).readable}</small>
      </FormGroup>

      <FormGroup label="Duration:">
        <Slider
          className={classes.batchEditorSlider}
          min={0}
          max={dayjs.duration(10, "years").asSeconds()}
          step={dayjs.duration(1, "day").asSeconds()}
          value={ttl}
          onChange={onTTLChange}
        />
        <small className="font-mono">{dayjs.duration(ttl).humanize()}</small>
      </FormGroup>

      <FormGroup label="Price:">
        <div>
          <small className="font-mono">{getPrice(depth, amount)}</small>
        </div>
      </FormGroup>
    </div>
  )
}

export default StorageBatchEditor
