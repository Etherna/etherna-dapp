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
