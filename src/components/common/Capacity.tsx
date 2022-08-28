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

import classes from "@/styles/components/common/Capacity.module.scss"

import { clamp } from "@/utils/math"

type CapacityProps = {
  className?: string
  value: number
  limit: number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "alert"
  width?: number | string
  isLoading?: boolean
}

const Capacity: React.FC<CapacityProps> = ({
  className,
  value,
  limit,
  color,
  width,
  isLoading,
}) => {
  const percent = useMemo(() => {
    return clamp(Math.round(value / limit * 100), 1, 100)
  }, [value, limit])

  return (
    <div
      className={classNames(classes.capacity, className, {
        [classes.loading]: isLoading,
      })}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={value}
      role="progressbar"
      style={{
        width: typeof width === "number" ? `${width}px` : width
      }}
    >
      <span
        className={classNames(classes.capacityProgress, {
          [classes.midFull]: percent > 40,
          [classes.almostFull]: percent > 65,
          [classes.capacityPrimary]: color === "primary",
          [classes.capacitySecondary]: color === "secondary",
          [classes.capacitySuccess]: color === "success",
          [classes.capacityWarning]: color === "warning",
          [classes.capacityError]: color === "error",
          [classes.capacityAlert]: color === "alert",
        })}
        style={{ width: !isLoading ? `${percent}%` : undefined }}
        aria-hidden
      />
    </div>
  )
}

export default Capacity
