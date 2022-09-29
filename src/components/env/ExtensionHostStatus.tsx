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
import { urlHostname } from "@etherna/api-js/utils"
import classNames from "classnames"

type ExtensionHostStatusProps = {
  title: string
  host: string
  isConnected: boolean | undefined
  iconSvg?: React.ReactNode
  compactMobile?: boolean
  onClick?(): void
}

const ExtensionHostStatus: React.FC<ExtensionHostStatusProps> = ({
  title,
  host,
  isConnected,
  iconSvg,
  compactMobile,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        "flex flex-grow items-center justify-items-center lg:justify-items-stretch"
      )}
      onClick={onClick}
    >
      {iconSvg && (
        <span
          className={classNames("block h-6 w-6 lg:h-5 lg:w-5", {
            "mr-2.5 lg:mr-4": compactMobile,
            "mr-5": !compactMobile,
          })}
        >
          {iconSvg}
        </span>
      )}

      <div
        className={classNames("flex flex-col items-start leading-none", {
          "hidden lg:flex": compactMobile,
          "floating-sidebar:flex": compactMobile,
        })}
      >
        <span className="text-sm font-semibold leading-none">{title}</span>
        <span className="mt-0.5 text-xs font-medium leading-none text-gray-500 dark:text-gray-300">
          {urlHostname(host)}
        </span>
      </div>

      <span
        className={classNames("h-1.5 w-1.5 rounded-full bg-gray-300", {
          "ml-auto": !compactMobile,
          "floating-sidebar:ml-auto lg:ml-auto": compactMobile,
          "bg-green-500 dark:bg-green-400": isConnected,
        })}
      />
    </div>
  )
}

export default ExtensionHostStatus
