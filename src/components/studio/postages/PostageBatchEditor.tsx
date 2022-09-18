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

import GatewayClient from "@/classes/GatewayClient"
import type SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import { FormGroup, Spinner } from "@/components/ui/display"
import { Slider } from "@/components/ui/inputs"
import type { GatewayBatch } from "@/definitions/api-gateway"
import type { GatewayType } from "@/definitions/extension-host"
import { calcDilutedTTL, getBatchCapacity, calcBatchPrice, ttlToAmount } from "@/utils/batches"
import { convertBytes } from "@/utils/converters"
import dayjs from "@/utils/dayjs"
import { clamp } from "@/utils/math"

type PostageBatchEditorProps = {
  batch: GatewayBatch
  batchesManager: SwarmBatchesManager
  gatewayType?: GatewayType
  disabled?: boolean
  onChange(depth: number, amount: string | undefined): void
}

const PostageBatchEditor: React.FC<PostageBatchEditorProps> = ({
  batch,
  batchesManager,
  gatewayType,
  disabled,
  onChange,
}) => {
  const [depth, setDepth] = useState(batch.depth)
  const [ttl, setTtl] = useState(batch.batchTTL)
  const [amount, setAmount] = useState("")
  const [currentPrice, setcurrentPrice] = useState<number>()

  const maxDepth = useMemo(() => {
    return gatewayType === "etherna-gateway" ? GatewayClient.maxBatchDepth : 50
  }, [gatewayType])

  const ttlReadable = useMemo(() => {
    let expiration: string
    const expirationTime = dayjs.duration({ seconds: ttl })
    const expireInDays = expirationTime.asDays()
    if (expireInDays < 0) {
      expiration = "never"
    } else if (expireInDays < 365) {
      expiration = expirationTime.humanize()
    } else {
      expiration = `${+(expireInDays / 365).toFixed(1)} years`
    }
    return expiration
  }, [ttl])

  useEffect(() => {
    batchesManager.fetchPrice().then(setcurrentPrice)
  }, [batchesManager])

  useEffect(() => {
    if (!currentPrice) return

    const dilutedTTL = calcDilutedTTL(batch.batchTTL, batch.depth, depth)
    const ttlDiff = clamp(ttl - dilutedTTL, 0, ttl)
    const newAmount = ttlToAmount(
      ttlDiff,
      currentPrice!,
      batchesManager.defaultBlockTime
    ).toString()

    startTransition(() => {
      setAmount(newAmount)
    })
  }, [batch, batchesManager.defaultBlockTime, currentPrice, ttl, depth])

  useEffect(() => {
    onChange(depth, amount)
  }, [depth, amount, onChange])

  const onDepthChange = useCallback(
    (newDepth: number) => {
      const normalizedDepth = newDepth < batch.depth ? batch.depth : newDepth
      const newTTL = calcDilutedTTL(ttl, depth, normalizedDepth)
      setDepth(normalizedDepth)
      setTtl(newTTL)
    },
    [ttl, depth, batch.depth]
  )

  const onTTLChange = useCallback(
    (newTTL: number) => {
      const dilutedTTL = calcDilutedTTL(batch.batchTTL, batch.depth, depth)
      setTtl(newTTL < dilutedTTL ? dilutedTTL : newTTL)
    },
    [batch, depth]
  )

  if (!currentPrice)
    return (
      <div className="m-auto p-8">
        <Spinner />
      </div>
    )

  return (
    <div>
      <FormGroup label="Size:">
        <Slider.Simple
          className="mt-1"
          min={17}
          max={maxDepth}
          step={1}
          value={depth}
          onChange={onDepthChange}
          disabled={disabled}
        />
        <small className="font-mono">
          <span>{convertBytes(getBatchCapacity(depth)).readable}</span>
          <span> / </span>
          <span>batch depth: {depth}</span>
        </small>
      </FormGroup>

      <FormGroup label="Duration:">
        <Slider.Simple
          className="mt-1"
          min={0}
          max={dayjs.duration(10, "years").asSeconds()}
          step={dayjs.duration(1, "day").asSeconds()}
          value={ttl}
          onChange={onTTLChange}
          disabled={disabled}
        />
        <small className="font-mono">
          <span>{ttlReadable}</span>
          <span> / </span>
          <span>batch amount: {amount}</span>
        </small>
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

export default PostageBatchEditor
