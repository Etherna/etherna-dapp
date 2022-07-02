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

import classes from "@/styles/components/navigation/TopbarPopupItem.module.scss"

import TopbarItem, { TopbarItemProps } from "./TopbarItem"
import TopbarPopupItemToggle from "./TopbarPopupItemToggle"
import Popup from "@/components/common/Popup"

type TopbarPopupItemProps = TopbarItemProps & {
  toggle?: React.ReactElement
}

const TopbarPopupItem: React.FC<TopbarPopupItemProps> = props => {
  return (
    <TopbarItem className={classes.topbarPopupItem}>
      <Popup
        toggle={
          <TopbarPopupItemToggle {...props} className={classes.popupTopbarItem}>
            {props.toggle}
          </TopbarPopupItemToggle>
        }
        placement="bottom"
        toggleClassName={classes.popupToggle}
        contentClassName={classes.popupContent}
        arrowClassName={classes.popupArrow}
      >
        {props.children}
      </Popup>
    </TopbarItem>
  )
}

export default TopbarPopupItem
