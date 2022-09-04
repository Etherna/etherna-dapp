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
import React, { useState } from "react"

import classNames from "classnames"

export type ProgressTabProps = {
  children?: React.ReactNode
  defaultKey: string
  id?: string
  className?: string
}

export type ProgressTabContentProps = {
  children: React.ReactNode
  tabKey: string
  active?: boolean
  title?: string
}

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

type RFCE<P> = React.FunctionComponentElement<P>

const ProgressTabLink: React.FC<ProgressTabLinkProps> = ({
  children,
  iconSvg,
  tabKey,
  title,
  text,
  active = false,
  progressList,
  onSelect,
}) => {
  return (
    <button
      className={classNames(
        "flex flex-col justify-center h-16 rounded text-sm font-medium p-4 md:w-44",
        "bg-gray-200/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300",
        {
          "bg-blue-400 text-gray-50": active,
        }
      )}
      onClick={() => onSelect?.(tabKey)}
      data-component="progresstab-link"
    >
      <span className="flex items-center flex-wrap">
        {iconSvg && <div className="mr-1.5 [&_svg]:h-[1.25em]">{iconSvg}</div>}
        <span className="inline-block">{children ?? title}</span>
        {text && (
          <p
            className={classNames(
              "text-xs italic font-normal text-left w-full text-gray-500/75 mt-1.5",
              {
                "text-gray-50/75": active,
              }
            )}
          >
            {text}
          </p>
        )}
      </span>
      {progressList && progressList.length > 0 && (
        <span className="flex items-center space-x-1 w-full mt-2">
          {progressList.map(({ progress, completed }, i) => (
            <div
              className={classNames(
                "relative flex-shrink w-4 h-1.5 rounded-sm overflow-hidden bg-gray-500/25",
                "transition-[width,flex-grow] duration-300",
                {
                  "flex-grow": typeof progress === "number" && !completed,
                  "bg-blue-400": completed,
                  "bg-gray-50": active && !completed,
                }
              )}
              key={i}
            >
              {typeof progress === "number" && !completed && (
                <span
                  className={classNames(
                    "absolute left-0 inset-y-0 rounded-sm bg-blue-400",
                    "transition-[width] duration-100 motion-safe:animate-pulse",
                    {
                      "bg-gray-50": active,
                    }
                  )}
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

const ProgressTabContent: React.FC<ProgressTabContentProps> = ({ children, active }) => {
  return (
    <div
      className={classNames({
        hidden: !active,
      })}
      data-component="progresstab-content"
    >
      {children}
    </div>
  )
}
ProgressTabContent.displayName = "ProgressTabContent"

const ProgressTab: React.FC<ProgressTabProps> & {
  Link: typeof ProgressTabLink
  Content: typeof ProgressTabContent
} = ({ children, defaultKey, id, className }) => {
  const [activeKey, setActiveKey] = useState(defaultKey)

  const links = React.Children.toArray(children).filter(
    (child: any) => child.type.displayName === "ProgressTabLink"
  ) as RFCE<ProgressTabLinkProps>[]
  const contents = React.Children.toArray(children).filter(
    (child: any) => child.type.displayName === "ProgressTabContent"
  ) as RFCE<ProgressTabContentProps>[]

  return (
    <div
      className={classNames(
        "flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-6 xl:space-x-8",
        className
      )}
      id={id}
      data-component="progress-tab"
    >
      <nav
        className={classNames(
          "flex-1 flex space-x-3 overflow-x-auto scrollbar-none",
          "md:flex-col md:flex-initial md:space-x-0 md:space-y-3 md:overflow-x-visible"
        )}
      >
        {links.map(child => (
          <ProgressTabLink
            {...child.props}
            active={activeKey === child.props.tabKey}
            onSelect={setActiveKey}
            key={child.props.tabKey}
          />
        ))}
      </nav>

      <div className="flex-grow">
        {contents.map(child => (
          <ProgressTabContent
            {...child.props}
            active={activeKey === child.props.tabKey}
            key={child.props.tabKey}
          />
        ))}
      </div>
    </div>
  )
}
ProgressTab.Link = ProgressTabLink
ProgressTab.Content = ProgressTabContent

export default ProgressTab
