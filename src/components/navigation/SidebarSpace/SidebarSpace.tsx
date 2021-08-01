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
import classnames from "classnames"

type SidebarSpaceProps = {
  flexible?: boolean
  customHeight?: string
}

const SidebarSpace: React.FC<SidebarSpaceProps> = ({ flexible, customHeight }) => {
  const height = flexible ? "auto" : (customHeight ?? "2.25rem")
  return (
    <div
      className={classnames("sidebar-space", { "flex-grow": flexible })}
      style={{ height }}
    />
  )
}

export default SidebarSpace
