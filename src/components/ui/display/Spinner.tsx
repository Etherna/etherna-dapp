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

import { cn } from "@/utils/classnames"

export type SpinnerProps = {
  className?: string
  type?: "spinner" | "bouncing-line"
  size?: number | string
  height?: number | string
}

const ticksCount = 12
const tickWidth = "8%"

const Spinner: React.FC<SpinnerProps> = ({ className, size, height, type = "spinner" }) => {
  switch (type) {
    case "spinner":
      return (
        <div
          className={cn("relative", className)}
          style={{
            width: size,
            height: size,
          }}
        >
          {Array(ticksCount)
            .fill(0)
            .map((_, i) => {
              return (
                <div
                  className={cn(
                    "absolute right-1/2 h-1/2 origin-bottom scale-95 transform animate-tick-fade",
                    "after:absolute after:inset-x-0 after:top-0 after:h-1/2 after:rounded-full after:bg-current"
                  )}
                  style={
                    {
                      width: tickWidth,
                      transform: `rotate(${i * 30}deg)`,
                      animationDelay: `-${(ticksCount - i) * 0.1}s`,
                      opacity: `${0.1 + (0.9 / (ticksCount - 1)) * i}`,
                      ["--tw-translate-x"]: parseInt(tickWidth) / 2,
                    } as any
                  }
                  key={i}
                />
              )
            })}
        </div>
      )
    case "bouncing-line":
      return (
        <div
          className={cn("relative flex h-1 overflow-hidden rounded-sm bg-gray-500/20", className)}
          style={{ width: size, height }}
        >
          <span className="mx-auto w-1/2 animate-tick-bounce rounded-sm bg-current" />
        </div>
      )
  }
}

export default Spinner
