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
import classNames from "classnames"

import classes from "@/styles/components/common/ProgressTabLink.module.scss"

export type ProgressTabLinkProps = {
  children?: React.ReactNode
  tabKey: string
  title?: string
  text?: string
  active?: boolean
  progressList?: Array<{
    progress: number | undefined | null
    completed: boolean
  }>
  iconSvg?: React.ReactNode
  onSelect?(tabKey: string): void
}

const ProgressTabLink: React.FC<ProgressTabLinkProps> = ({
  children,
  iconSvg,
  tabKey,
  title,
  text,
  active = false,
  progressList,
  onSelect
}) => {
  return (
    <button
      className={classNames(classes.progresstabLink, { [classes.active]: active })}
      onClick={() => onSelect?.(tabKey)}
    >
      <span className={classes.progresstabLinkText}>
        {iconSvg && (
          <div className={classes.progresstabLinkIcon}>
            {iconSvg}
          </div>
        )}
        <span className={classes.progresstabLinkTitle}>{children ?? title}</span>
        {text && (
          <p className={classes.progresstabLinkDescription}>{text}</p>
        )}
      </span>
      {progressList && progressList.length > 0 && (
        <span className={classes.progresstabLinkProgress}>
          {progressList.map(({ progress, completed }, i) => (
            <div
              className={classNames(classes.progresstabLinkProgressBar, {
                [classes.active]: typeof progress === "number" && !completed,
                [classes.completed]: completed,
              })}
              key={i}
            >
              {typeof progress === "number" && !completed && (
                <span
                  className={classes.progresstabLinkProgressValue}
                  style={{ width: `${(progress ?? 0) * 100}%` }}
                  data-progress={progress}
                />
              )}
            </div>
          ))}
        </span>
      )}
    </button>
  )
}
ProgressTabLink.displayName = "ProgressTabLink"

export default ProgressTabLink
