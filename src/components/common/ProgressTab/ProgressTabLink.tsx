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

export type ProgressTabLinkProps = {
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
      className={classNames("progresstab-link", { active })}
      onClick={() => onSelect?.(tabKey)}
    >
      <span className="progresstab-link-text">
        {iconSvg && (
          <div className="progresstab-link-icon">
            {iconSvg}
          </div>
        )}
        <span className="progresstab-link-title">{children ?? title}</span>
        {text && (
          <p className="progresstab-link-description">{text}</p>
        )}
      </span>
      {progressList && progressList.length > 0 && (
        <span className="progresstab-link-progress">
          {progressList.map(({ progress, completed }, i) => (
            <div
              className={classNames("progresstab-link-progress-bar", {
                active: typeof progress === "number" && !completed,
                completed,
              })}
            >
              {typeof progress === "number" && !completed && (
                <span
                  className="progresstab-link-progress-value"
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

export default ProgressTabLink
