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

import { Skeleton } from "../ui/display"

const VideoCommentPlaceholder = () => {
  return (
    <div className="mb-3 flex">
      <Skeleton roundedFull>
        <div className="h-10 w-10" />
      </Skeleton>
      <div className="ml-2 mt-1 flex flex-1 flex-col">
        <Skeleton className="w-32" roundedThin>
          <div className="h-4 w-full" />
        </Skeleton>
        <Skeleton className="mt-1.5 w-full max-w-xs" roundedThin>
          <div className="h-3" />
        </Skeleton>
      </div>
    </div>
  )
}

export default VideoCommentPlaceholder
