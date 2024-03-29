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

const ProfileInfoPlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="row items-center">
        <div className="col px-4 md:max-w-xxs">
          <Skeleton roundedFull>
            <div className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40" />
          </Skeleton>
        </div>
        <div className="col mt-4 flex-1 px-4">
          <div className="flex items-center space-y-2">
            <Skeleton className="w-1/2 sm:mx-auto md:ml-0">
              <div className="h-7 w-full" />
            </Skeleton>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col p-4 md:max-w-xxs">
          <Skeleton className="mt-2" roundedFull>
            <div className="h-9 w-full" />
          </Skeleton>
          <Skeleton className="mt-2" roundedFull>
            <div className="h-9 w-full" />
          </Skeleton>
        </div>
        <div className="col flex-1 p-4">{children}</div>
      </div>
    </>
  )
}

export default ProfileInfoPlaceholder
