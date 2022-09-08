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

const ProfilePreviewPlaceholder = () => {
  const rows = 5
  const arrayMap = [...Array(rows).keys()]

  const videos = 3
  const videosMap = [...Array(videos).keys()]

  return (
    <>
      {arrayMap.map(i => (
        <div className="border-t-4 border-gray-200 py-4 dark:border-gray-800" key={i}>
          <div className="flex items-center py-2">
            <Skeleton roundedFull>
              <div className="h-8 w-8" />
            </Skeleton>
            <Skeleton className="ml-2" squared>
              <div className="h-4 w-40" />
            </Skeleton>
          </div>
          <div className="flex">
            {videosMap.map(i => (
              <div className="mr-2 flex flex-col" key={i}>
                <Skeleton squared>
                  <div className="h-32 w-64" />
                </Skeleton>
                <Skeleton squared>
                  <div className="h-4 w-full" />
                </Skeleton>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default ProfilePreviewPlaceholder
