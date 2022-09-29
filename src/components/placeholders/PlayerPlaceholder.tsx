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

const PlayerPlaceholder = () => {
  return (
    <>
      <Skeleton className="mt-12 mb-8 w-full">
        <div className="h-32 pb-[62%]" />
      </Skeleton>
      <div className="flex flex-col">
        <Skeleton roundedThin>
          <div className="h-6 w-3/5" />
        </Skeleton>
        <Skeleton className="mt-6">
          <div className="h-20 w-full" />
        </Skeleton>

        <div className="mt-6 flex items-center">
          <Skeleton roundedFull>
            <div className="h-10 w-10" />
          </Skeleton>
          <Skeleton className="ml-2" roundedThin>
            <div className="h-4 w-24" />
          </Skeleton>
        </div>
      </div>
    </>
  )
}

export default PlayerPlaceholder
