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

import { clamp } from "@/utils/math"

export type CapacityProps = {
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
    return clamp(Math.round((value / limit) * 100), 1, 100)
  }, [value, limit])

  return (
    <div
      className={classNames(
        "relative h-2.5 w-14 overflow-hidden rounded bg-gray-200 dark:bg-gray-700",
        className
      )}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={value}
      role="progressbar"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
      }}
      data-component="capacity"
    >
      <span
        className={classNames("absolute bg-primary-400", {
          "inset-y-0 left-0": !isLoading,
          "inset-0 w-full": isLoading,
          "bg-yellow-400 dark:bg-yellow-400": color === undefined && percent > 40,
          "bg-red-500 dark:bg-red-500": color === "error" || (color === undefined && percent > 65),
          "bg-black dark:bg-white": color === "primary",
          "bg-gray-400 dark:bg-gray-300": color === "secondary",
          "bg-sky-500 dark:bg-sky-500": color === "success",
          "bg-yellow-500 dark:bg-yellow-500": color === "warning",
          "bg-pink-500 dark:bg-pink-500": color === "alert",
        })}
        style={{ width: !isLoading ? `${percent}%` : undefined }}
        aria-hidden
        data-component="capacity"
      />
    </div>
  )
}

export default Capacity
