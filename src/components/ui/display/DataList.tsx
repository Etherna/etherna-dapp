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

export type DataListProps = {
  data: Array<{ title: string; value: string | number }>
}

const DataList: React.FC<DataListProps> = ({ data }) => {
  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {data.map(({ title, value }) => (
        <div key={title}>
          <dt className="text-sm text-gray-400 dark:text-gray-500">{title}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default DataList
