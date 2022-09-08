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

import { Skeleton } from "../ui/display"

type VideoPreviewPlaceholderProps = {
  mini?: boolean
}

const VideoPreviewPlaceholder: React.FC<VideoPreviewPlaceholderProps> = ({ mini }) => {
  return (
    <div className="flex flex-col">
      <Skeleton squared>
        <div className="w-full pb-[62%]" />
      </Skeleton>
      <div className="items-top mt-2 flex">
        {!mini && (
          <Skeleton className="h-8 w-8 shrink-0" roundedFull>
            <div className="h-8 w-8" />
          </Skeleton>
        )}
        <div
          className={classNames("mt-1 flex flex-grow flex-col", {
            "ml-2": !mini,
          })}
        >
          <Skeleton className="h-4 w-full" roundedThin>
            <div className="h-4 w-full" />
          </Skeleton>
          <Skeleton className="mt-1.5 h-3 w-2/5" roundedThin>
            <div className="h-3 w-2/5" />
          </Skeleton>
        </div>
      </div>
    </div>
  )
}

export default VideoPreviewPlaceholder
