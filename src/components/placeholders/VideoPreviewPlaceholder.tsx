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

import { Skeleton } from "@/components/ui/display"
import { cn } from "@/utils/classnames"

type VideoPreviewPlaceholderProps = {
  mini?: boolean
  direction?: "horizontal" | "vertical"
}

const VideoPreviewPlaceholder: React.FC<VideoPreviewPlaceholderProps> = ({
  mini,
  direction = "vertical",
}) => {
  return (
    <div
      className={cn("flex w-full", {
        "flex-col": direction === "vertical",
        "flex-col sm:flex-row": direction === "horizontal",
      })}
    >
      <Skeleton
        className={cn({
          "w-full": direction === "vertical",
          "w-full sm:w-1/3": direction === "horizontal",
        })}
        squared
      >
        <div className="w-full pb-[56.25%]" />
      </Skeleton>
      <div
        className={cn("items-top mt-2 flex flex-1", {
          "sm:ml-2 sm:mt-0": direction === "horizontal",
        })}
      >
        {!mini && (
          <Skeleton
            className={cn("h-8 w-8 shrink-0", {
              "sm:hidden": direction === "horizontal",
            })}
            roundedFull
          >
            <div className="h-8 w-8" />
          </Skeleton>
        )}
        <div
          className={cn("mt-1 flex flex-grow flex-col", {
            "ml-2": !mini,
            "sm:space-y-2": direction === "horizontal",
          })}
        >
          <Skeleton className="h-4 w-full" roundedThin>
            <div className="h-4 w-full" />
          </Skeleton>
          <div className="mt-1.5 flex items-center">
            {direction === "horizontal" && (
              <div className="hidden sm:mr-2 sm:flex">
                <Skeleton className="h-8 w-8 shrink-0" roundedFull>
                  <div className="h-8 w-8" />
                </Skeleton>
              </div>
            )}
            <Skeleton className="w-2/5" roundedThin>
              <div className="h-3 w-2/5" />
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPreviewPlaceholder
