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

import classes from "@styles/components/common/ProgressTabContent.module.scss"

export type ProgressTabContentProps = {
  children: React.ReactNode
  tabKey: string
  active?: boolean
  title?: string
}

const ProgressTabContent: React.FC<ProgressTabContentProps> = ({ children, active }) => {
  return (
    <div
      className={classNames(classes.progresstabContent, {
        [classes.active]: active,
      })}
    >
      {children}
    </div>
  )
}
ProgressTabContent.displayName = "ProgressTabContent"

export default ProgressTabContent
