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
import classNames from "classnames"

import { clamp } from "@/utils/math"

export type ProgressBarProps = {
  className?: string
  progress?: number
  indeterminate?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ className, progress = 0, indeterminate }) => {
  return (
    <div
      className={classNames(
        "relative block h-1 w-full overflow-hidden rounded-full bg-gray-300/50 dark:bg-gray-700/50",
        className
      )}
      data-component="progress-bar"
    >
      <div
        className={classNames("h-full rounded-full bg-primary-500 text-primary-500", {
          "absolute inset-0 w-full animate-slide": indeterminate,
        })}
        style={{
          width: !indeterminate ? `${clamp(progress, 0, 100)}%` : undefined,
          background: indeterminate
            ? `linear-gradient(
            to right,
            transparent 0%,
            current 50%,
            transparent 100%
          )`
            : undefined,
        }}
      />
    </div>
  )
}

export default ProgressBar
