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

import "./extension-host-status.scss"

import { urlHostname } from "@utils/urls"

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
  onClick
}) => {
  return (
    <div className={classNames("extension-host-status", { "compact-mobile": compactMobile })} onClick={onClick}>
      {iconSvg && (
        <span className="extension-host-status-icon">
          {iconSvg}
        </span>
      )}

      <div className="extension-host-status-detail">
        <span className="extension-host-status-title">{title}</span>
        <span className="extension-host-status-host">{urlHostname(host)}</span>
      </div>

      <span className={classNames("extension-host-status-preview", { active: isConnected })}></span>
    </div>
  )
}

export default ExtensionHostStatus
