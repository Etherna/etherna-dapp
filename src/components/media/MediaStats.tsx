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

import classes from "@styles/components/media/MediaStats.module.scss"
import { ReactComponent as ChevronDownIcon } from "@assets/icons/chevron-down.svg"

type MediaStatsProps = {
  stats: Array<{ label: string, value: string | JSX.Element }>
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
    <div className={classNames(classes.mediaStats, { [classes.expanded]: expanded })}>
      <button className={classes.mediaStatsBtn} onClick={() => setExpanded(!expanded)}>
        <span>
          {expanded ? hideText : showText}
        </span>
        <span className={classes.icon}>
          <ChevronDownIcon />
        </span>
      </button>

      <div
        className={classes.mediaStatsContent}
        style={{ maxHeight: expanded ? `${tableRef.current.clientHeight}px` : undefined }}
      >
        <table className={classes.mediaStatsTable} ref={tableRef}>
          <tbody>
            {stats.map((stat, i) => (
              <tr key={i}>
                <th>{stat.label}</th>
                <td>{stat.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MediaStats
