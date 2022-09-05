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
        <div className="w-full aspect-video" />
      </Skeleton>
      <div className="flex items-top mt-2">
        {!mini && (
          <Skeleton roundedFull>
            <div className="w-8 h-8" />
          </Skeleton>
        )}
        <div
          className={classNames("flex flex-col flex-1 mt-1", {
            "ml-2": !mini,
          })}
        >
          <Skeleton roundedThin>
            <div className="w-full h-4" />
          </Skeleton>
          <Skeleton className="mt-1.5" roundedThin>
            <div className="w-2/5 h-3" />
          </Skeleton>
        </div>
      </div>
    </div>
  )
}

export default VideoPreviewPlaceholder
