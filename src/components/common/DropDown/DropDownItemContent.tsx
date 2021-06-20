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

type DropDownItemContentProps = {
  children: React.ReactNode
  icon?: React.ReactNode
  status?: "active" | "inactive"
}

const DropDownItemContent = ({ children, icon, status }: DropDownItemContentProps) => {
  return (
    <div className="flex items-center w-full">
      {icon}
      <span>{children}</span>
      {status && (
        <span className={classnames("item-status", { [`item-status-${status}`]: status })} />
      )}
    </div>
  )
}

export default DropDownItemContent
