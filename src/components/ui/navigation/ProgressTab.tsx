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

import { cn } from "@/utils/classnames"

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
      className={cn("flex h-16 flex-col justify-center rounded p-4 text-sm font-medium md:w-44", {
        "text-gray-800 dark:text-gray-300": !active,
        "bg-gray-200/50 dark:bg-gray-700/50": !active,
        "bg-blue-400 text-gray-50": active,
      })}
      onClick={() => onSelect?.(tabKey)}
      data-component="progresstab-link"
    >
      <span className="flex flex-wrap items-center">
        {iconSvg && <div className="mr-1.5 [&_svg]:h-[1.25em]">{iconSvg}</div>}
        <span className="inline-block">{children ?? title}</span>
        {text && (
          <p
            className={cn("mt-1.5 w-full text-left text-xs font-normal italic", {
              "text-gray-500/75": !active,
              "text-gray-50/75": active,
            })}
          >
            {text}
          </p>
        )}
      </span>
      {progressList && progressList.length > 0 && (
        <span className="mt-2 flex w-full items-center space-x-1">
          {progressList.map(({ progress, completed }, i) => (
            <div
              className={cn(
                "relative h-1.5 w-4 flex-shrink overflow-hidden rounded-sm",
                "transition-[width,flex-grow] duration-300",
                {
                  "flex-grow": typeof progress === "number" && !completed,
                  "bg-gray-500/25": !completed,
                  "bg-blue-400": completed && !active,
                  "bg-gray-50": active,
                }
              )}
              key={i}
            >
              {typeof progress === "number" && !completed && (
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-sm",
                    "transition-[width] duration-100 motion-safe:animate-pulse",
                    {
                      "bg-blue-400": !active,
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
      className={cn({
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
      className={cn(
        "flex flex-col space-y-8 md:flex-row md:space-x-6 md:space-y-0 xl:space-x-8",
        className
      )}
      id={id}
      data-component="progress-tab"
    >
      <nav
        className={cn(
          "flex flex-1 space-x-3 overflow-x-auto scrollbar-none",
          "md:flex-initial md:flex-col md:space-x-0 md:space-y-3 md:overflow-x-visible"
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
