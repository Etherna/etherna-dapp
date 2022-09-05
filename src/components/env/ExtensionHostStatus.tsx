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

import { urlHostname } from "@/utils/urls"

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
    <div className={classNames("flex-grow flex items-center")} onClick={onClick}>
      {iconSvg && <span className="block w-5 h-5 mr-3">{iconSvg}</span>}

      <div
        className={classNames("flex flex-col items-start leading-none", {
          "hidden lg:flex": compactMobile,
          "floating-sidebar:flex": compactMobile,
        })}
      >
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
          {urlHostname(host)}
        </span>
      </div>

      <span
        className={classNames("w-1.5 h-1.5 rounded-full ml-auto bg-gray-300", {
          "bg-green-500 dark:bg-green-400": isConnected,
        })}
      />
    </div>
  )
}

export default ExtensionHostStatus
