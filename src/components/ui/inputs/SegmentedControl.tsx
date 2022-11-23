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
import React, { useCallback } from "react"
import Tippy from "@tippyjs/react"

import classNames from "@/utils/classnames"

export type SegmentedControlProps = {
  entries: Array<{ value: string; label: string; tip?: string }>
  value: string
  defaultValue: string
  name?: string
  onChange?(val: string): void
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  entries,
  value,
  defaultValue,
  name,
  onChange,
}) => {
  const isChcked = useCallback(
    (entryValue: string) => {
      return value ? entryValue === value : entryValue === defaultValue
    },
    [defaultValue, value]
  )

  return (
    <div
      className={classNames(
        "relative flex w-full select-none rounded-lg font-semibold",
        "bg-gray-400/5 text-white dark:bg-gray-100/5"
      )}
      data-component="segmented-control"
    >
      {entries.map(entry => (
        <React.Fragment key={entry.value}>
          <input
            className="hidden"
            type="radio"
            name={name}
            value={entry.value}
            id={`entry-${entry.value}`}
            checked={isChcked(entry.value)}
            onChange={() => onChange?.(entry.value)}
          />
          <Tippy
            className="chart-toolbar-tippy"
            allowHTML={true}
            delay={150}
            placement="top"
            content={entry.tip}
            visible={entry.tip ? undefined : false}
          >
            <label
              className={classNames(
                "m-1 flex-1 rounded-md px-2 py-1 text-center",
                "text-gray-600 dark:text-gray-300",
                {
                  "bg-primary-500 text-white": isChcked(entry.value),
                }
              )}
              htmlFor={`entry-${entry.value}`}
            >
              {entry.label}
            </label>
          </Tippy>
        </React.Fragment>
      ))}
    </div>
  )
}

export default SegmentedControl
