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

import classes from "@styles/components/navigation/SidebarLinksToggle.module.scss"
import { ReactComponent as ExternalIcon } from "@assets/icons/navigation/external.svg"
import { ReactComponent as ArrowIcon } from "@assets/icons/arrow-fill-right.svg"

import SidebarItem from "@components/navigation/SidebarItem"

const SidebarLinksToggle: React.FC = () => {
  return (
    <div className={classes.sidebarLinksToggle}>
      <SidebarItem
        className={classes.sidebarItem}
        iconClassName={classes.sidebarItemIcon}
        iconSvg={<ExternalIcon />}
      />
      <div className={classes.sidebarLinksToggleArrow}>
        <ArrowIcon />
      </div>
    </div>
  )
}

export default SidebarLinksToggle