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
import Tippy from "@tippyjs/react"

import classes from "@/styles/components/common/SegmentedControl.module.scss"

type SegmentedControlProps = {
  entries: Array<{ value: string, label: string, tip?: string }>
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
  return (
    <div className={classes.segmentedControl}>
      {entries.map(entry => (
        <React.Fragment key={entry.value}>
          <input
            type="radio"
            name={name}
            value={entry.value}
            id={`entry-${name}-${entry.value}`}
            checked={value ? entry.value === value : entry.value === defaultValue}
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
            <label htmlFor={`entry-${name}-${entry.value}`}>
              {entry.label}
            </label>
          </Tippy>
        </React.Fragment>
      ))}
    </div>
  )
}

export default SegmentedControl
