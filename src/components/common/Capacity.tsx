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
