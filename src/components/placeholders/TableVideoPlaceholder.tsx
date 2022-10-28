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

type TableVideoPlaceholderProps = {
  count?: number
}

const TableVideoPlaceholder: React.FC<TableVideoPlaceholderProps> = ({ count = 4 }) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <tr className="" key={i}>
            <td />
            <td className="py-1">
              <div className="flex items-center space-x-2">
                <Skeleton squared>
                  <div className="h-12 w-20" />
                </Skeleton>
                <Skeleton>
                  <div className="ml-3 h-5 w-28" />
                </Skeleton>
              </div>
            </td>
            <td>
              <Skeleton>
                <div className="h-5 w-16" />
              </Skeleton>
            </td>
            <td>
              <Skeleton>
                <div className="h-5 w-14" />
              </Skeleton>
            </td>
            <td>
              <Skeleton>
                <div className="h-5 w-28" />
              </Skeleton>
            </td>
            <td>
              <Skeleton>
                <div className="h-5 w-28" />
              </Skeleton>
            </td>
          </tr>
        ))}
    </>
  )
}

export default TableVideoPlaceholder
