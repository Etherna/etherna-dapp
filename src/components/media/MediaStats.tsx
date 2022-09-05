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
import React, { useRef, useState } from "react"
import classNames from "classnames"

import { ChevronDownIcon } from "@heroicons/react/solid"

type MediaStatsProps = {
  stats: Array<{ label: string; value: string | JSX.Element }>
  showText?: string
  hideText?: string
}

const MediaStats: React.FC<MediaStatsProps> = ({
  stats,
  showText = "Show stats",
  hideText = "Hide stats",
}) => {
  const [expanded, setExpanded] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null!)

  return (
    <div>
      <button
        className={classNames(
          "flex items-center bg-transparent border-none px-0 py-3 space-x-2",
          "text-sm font-medium text-gray-500 dark:text-gray-300 active:text-gray-600 dark:active:text-gray-200",
          "transition-colors duration-200",
          {
            "text-gray-800 dark:text-gray-100": expanded,
          }
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <span>{expanded ? hideText : showText}</span>
        <span className="transform transition-transform duration-200">
          <ChevronDownIcon
            className={classNames("h-[1.25em]", {
              "rotate-180": expanded,
            })}
            aria-hidden
          />
        </span>
      </button>

      <div
        className="overflow-hidden max-h-0 transition-[max-height] duration-300"
        style={{ maxHeight: expanded ? `${tableRef.current.clientHeight}px` : undefined }}
      >
        <table
          className={classNames(
            "table-fixed w-full transform -translate-y-full opacity-0 transition duration-300",
            {
              "translate-y-0 opacity-100": expanded,
            }
          )}
          ref={tableRef}
        >
          <tbody>
            {stats.map((stat, i) => (
              <tr className="text-xs text-left truncate" key={i}>
                <th className="w-[80px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                  {stat.label}
                </th>
                <td className="font-medium text-gray-900 dark:text-gray-200 pl-5 truncate">
                  {stat.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MediaStats
