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

import Placeholder from "@/components/common/Placeholder"

type TableVideoPlaceholderProps = {
  count?: number
}

const TableVideoPlaceholder: React.FC<TableVideoPlaceholderProps> = ({ count = 2 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <tr key={i}>
          <td></td>
          <td>
            <div className="flex items-center">
              <Placeholder className="w-20 h-14 rounded-md" />
              <Placeholder className="w-28 h-5 rounded-md ml-3" />
            </div>
          </td>
          <td>
            <Placeholder className="w-10 h-5 rounded-md" />
          </td>
          <td>
            <Placeholder className="w-14 h-5 rounded-md" />
          </td>
          <td>
            <Placeholder className="w-28 h-5 rounded-md" />
          </td>
          <td>
            <Placeholder className="w-28 h-5 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  )
}

export default TableVideoPlaceholder
