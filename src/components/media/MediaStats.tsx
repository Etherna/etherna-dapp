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

import { ChevronDownIcon } from "@heroicons/react/24/outline"

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
  const container = useRef<HTMLDivElement>(null!)

  return (
    <div>
      <button
        className={classNames(
          "flex items-center space-x-2 border-none bg-transparent px-0 py-0",
          "text-sm font-medium text-gray-500 active:text-gray-600 dark:text-gray-300 dark:active:text-gray-200",
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
            className={classNames("h-[1.1em]", {
              "rotate-180": expanded,
            })}
            strokeWidth={2.5}
            aria-hidden
          />
        </span>
      </button>

      <div
        className="max-h-0 overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: expanded ? `${container.current.scrollHeight}px` : undefined }}
        ref={container}
      >
        <div className="py-1" />
        <table className={classNames("w-full table-fixed transition")}>
          <tbody>
            {stats.map((stat, i) => (
              <tr className="truncate text-left text-xs" key={i}>
                <th className="w-[80px] truncate font-semibold text-gray-500 dark:text-gray-400">
                  {stat.label}
                </th>
                <td className="truncate pl-5 font-medium text-gray-900 dark:text-gray-200">
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
