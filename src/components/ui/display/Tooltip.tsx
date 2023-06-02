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

import classNames from "@/utils/classnames"

import type { Placement } from "@popperjs/core"

import "tippy.js/dist/tippy.css"

export type TooltipProps = {
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
      className={classNames(
        "w-auto max-w-xxs rounded-md px-3 py-2 font-normal normal-case leading-normal",
        "shadow-2xl shadow-gray-500/20 dark:shadow-white/40",
        {
          "bg-white text-black dark:bg-black dark:text-white": !invert && !color,
          "[&_.tippy-arrow]:text-white [&_.tippy-arrow]:dark:text-black": !invert && !color,
          "bg-black text-white dark:bg-white dark:text-black": invert && !color,
          "[&_.tippy-arrow]:text-black [&_.tippy-arrow]:dark:text-white": invert && !color,
          "bg-gray-400 text-white dark:bg-gray-400 dark:text-white": color === "secondary",
          "[&_.tippy-arrow]:text-gray-400 [&_.tippy-arrow]:dark:text-gray-400":
            color === "secondary",
          "bg-blue-500 text-white dark:bg-blue-500 dark:text-white": color === "success",
          "[&_.tippy-arrow]:text-blue-500 [&_.tippy-arrow]:dark:text-blue-500": color === "success",
          "bg-yellow-500 text-white dark:bg-yellow-500 dark:text-white": color === "warning",
          "[&_.tippy-arrow]:text-yellow-500 [&_.tippy-arrow]:dark:text-yellow-500":
            color === "warning",
          "bg-red-500 text-white dark:bg-red-500 dark:text-white": color === "error",
          "[&_.tippy-arrow]:text-red-500 [&_.tippy-arrow]:dark:text-red-500": color === "error",
          "bg-pink-500 text-white dark:bg-pink-500 dark:text-white": color === "alert",
          "[&_.tippy-arrow]:text-pink-500 [&_.tippy-arrow]:dark:text-pink-500": color === "alert",
          "text-center": center,
        },
        className
      )}
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
