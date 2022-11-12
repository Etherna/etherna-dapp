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
import React, { useEffect, useRef } from "react"

import classNames from "@/utils/classnames"
import { clamp } from "@/utils/math"

export type ProgressBarProps = {
  className?: string
  progress?: number
  color?: "primary" | "rainbow"
  indeterminate?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  className,
  color = "primary",
  progress = 0,
  indeterminate,
}) => {
  const progressBar = useRef<HTMLDivElement>(null)
  const animation = useRef<Animation>()

  useEffect(() => {
    if (!progressBar.current) return

    if (color === "rainbow") {
      animation.current = progressBar.current.animate(
        [
          { background: "hsl(0 80% 80%)" },
          { background: "hsl(60 80% 80%)" },
          { background: "hsl(120 80% 80%)" },
          { background: "hsl(180 80% 80%)" },
          { background: "hsl(240 80% 80%)" },
          { background: "hsl(300 80% 80%)" },
          { background: "hsl(360 80% 80%)" },
        ],
        {
          duration: 8000,
          iterations: Infinity,
          fill: "both",
        }
      )
    } else {
      animation.current?.cancel()
    }
  }, [color])

  return (
    <div
      className={classNames(
        "relative block h-1 w-full overflow-hidden rounded-full bg-gray-300/50 dark:bg-gray-700/50",
        className
      )}
      data-component="progress-bar"
    >
      <div
        className={classNames("h-full rounded-full", {
          "bg-primary-500 text-primary-500": color === "primary",
          "animate-[pulse_4s_infinite]": color === "rainbow",
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
        ref={progressBar}
      />
    </div>
  )
}

export default ProgressBar
