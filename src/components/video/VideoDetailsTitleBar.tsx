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

type VideoDetailsTitleBarProps = {
  children?: React.ReactNode
  title?: string | null
}

const VideoDetailsTitleBar: React.FC<VideoDetailsTitleBarProps> = ({ title, children }) => {
  return (
    <div className="mb-5 flex items-start">
      <h1
        className={cn(
          "mb-0 max-w-full flex-1 flex-grow overflow-hidden",
          "line-clamp-4 text-ellipsis text-2xl font-semibold",
          {
            "opacity-50": !title,
          }
        )}
        title={title ?? ""}
      >
        {title || "Untitled"}
      </h1>

      <div className="flex shrink-0 flex-col gap-x-8 gap-y-3 pt-1 sm:flex-row-reverse sm:items-center">
        {children}
      </div>
    </div>
  )
}

export default VideoDetailsTitleBar
