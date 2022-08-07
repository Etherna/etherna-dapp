import React from "react"
import Tippy from "@tippyjs/react"
import classNames from "classnames"
import type { Placement } from "@popperjs/core"

import "tippy.js/dist/tippy.css"
import classes from "@/styles/components/common/Tooltip.module.scss"

type TooltipProps = {
  children: React.ReactElement
  className?: string
  text: string
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "alert"
  invert?: boolean
  center?: boolean
  visible?: boolean
  arrow?: boolean
  delay?: number
  placement?: Placement
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  className,
  text,
  color,
  visible,
  arrow = true,
  invert = true,
  center = true,
  delay = 150,
  placement,
}) => {
  return (
    <Tippy
      className={classNames(classes.tooltip, className, {
        ["text-center"]: center,
        [classes.tooltipInverted]: invert,
        [classes.tooltipSecondary]: color === "secondary",
        [classes.tooltipSuccess]: color === "success",
        [classes.tooltipWarning]: color === "warning",
        [classes.tooltipError]: color === "error",
        [classes.tooltipAlert]: color === "alert",
      })}
      allowHTML={true}
      delay={delay}
      content={text}
      placement={placement}
      visible={visible}
      arrow={arrow}
      interactive
    >
      {children}
    </Tippy>
  )
}

export default Tooltip
