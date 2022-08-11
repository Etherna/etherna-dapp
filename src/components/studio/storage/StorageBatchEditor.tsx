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

import React, { useCallback, useEffect, useState, startTransition, useMemo } from "react"

import classes from "@/styles/components/studio/storage/StorageBatchEditor.module.scss"

import Spinner from "@/components/common/Spinner"
import FormGroup from "@/components/common/FormGroup"
import Slider from "@/components/common/Slider"
import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import EthernaGatewayClient from "@/classes/EthernaGatewayClient"
import { calcDilutedTTL, getBatchCapacity, calcBatchPrice, ttlToAmount } from "@/utils/batches"
import { convertBytes } from "@/utils/converters"
import dayjs from "@/utils/dayjs"
import { clamp } from "@/utils/math"
import type { GatewayBatch } from "@/definitions/api-gateway"
import type { GatewayType } from "@/definitions/extension-host"

type StorageBatchEditorProps = {
  batch: GatewayBatch
  batchesManager: SwarmBatchesManager
  gatewayType?: GatewayType
  onChange(depth: number, amount: string | undefined): void
}

const StorageBatchEditor: React.FC<StorageBatchEditorProps> = ({ batch, batchesManager, gatewayType, onChange }) => {
  const [depth, setDepth] = useState(batch.depth)
  const [ttl, setTtl] = useState(batch.batchTTL)
  const [amount, setAmount] = useState("")
  const [currentPrice, setcurrentPrice] = useState<number>()

  const maxDepth = useMemo(() => {
    return gatewayType === "etherna-gateway" ? EthernaGatewayClient.maxBatchDepth : 50
  }, [gatewayType])

  useEffect(() => {
    batchesManager.fetchPrice().then(setcurrentPrice)
  }, [batchesManager])

  useEffect(() => {
    if (!currentPrice) return

    const ttlDiff = clamp(ttl - batch.batchTTL, 0, ttl)
    const newAmount = ttlToAmount(ttlDiff, currentPrice!, batchesManager.defaultBlockTime).toString()

    startTransition(() => {
      setAmount(newAmount)
    })
  }, [batch.batchTTL, batchesManager.defaultBlockTime, currentPrice, ttl])

  useEffect(() => {
    onChange(depth, amount)
  }, [depth, amount, onChange])

  const onDepthChange = useCallback((newDepth: number) => {
    const normalizedDepth = newDepth < batch.depth ? batch.depth : newDepth
    const newTTL = calcDilutedTTL(ttl, depth, normalizedDepth)
    setDepth(normalizedDepth)
    setTtl(newTTL)
  }, [ttl, depth, batch.depth])

  const onTTLChange = useCallback((newTTL: number) => {
    const dilutedTTL = calcDilutedTTL(batch.batchTTL, batch.depth, depth)
    setTtl(newTTL < dilutedTTL ? dilutedTTL : newTTL)
  }, [batch, depth])

  if (!currentPrice) return (
    <div className="m-auto p-8">
      <Spinner />
    </div>
  )

  return (
    <div>
      <FormGroup label="Size:">
        <Slider
          className={classes.batchEditorSlider}
          min={17}
          max={maxDepth}
          step={1}
          value={depth}
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
        <small className="font-mono">{dayjs.duration(ttl, "seconds").humanize()}</small>
      </FormGroup>

      {gatewayType === "bee" && (
        <FormGroup label="Price:">
          <div>
            <small className="font-mono">{calcBatchPrice(depth, amount)}</small>
          </div>
        </FormGroup>
      )}
    </div>
  )
}

export default StorageBatchEditor
