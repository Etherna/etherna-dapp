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
import omit from "lodash/omit"

import TopbarItem, { TopbarItemProps } from "@components/navigation/TopbarItem"

const TopbarPopupItemToggle: React.FC<TopbarItemProps> = props => {
  const itemProps = { ...omit(props, "children") }

  return (
    <TopbarItem {...itemProps} ignoreHoverState>
      {props.children && (
        props.children
      )}
    </TopbarItem>
  )
}

export default TopbarPopupItemToggle
