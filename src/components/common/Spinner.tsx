import React from "react"
import classNames from "classnames"

import classes from "@/styles/components/common/Spinner.module.scss"

export type SpinnerProps = {
  className?: string
  size?: number | string
}

const ticksCount = 12

const Spinner: React.FC<SpinnerProps> = ({ size, className }) => {
  const ticks = new Array(ticksCount).fill(0)
  return (
    <div
      className={classNames(classes.spinner, className)}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size
      }}
    >
      {ticks.map((_, i) => {
        return (
          <div
            className={classes.spinnerTick}
            key={i}
          />
        )
      })}
    </div>
  )
}

export default Spinner
