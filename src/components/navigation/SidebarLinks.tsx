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

import classes from "@styles/components/navigation/SidebarLinks.module.scss"

import SidebarLinksList from "./SidebarLinksList"
import SidebarLinksToggle from "./SidebarLinksToggle"
import SidebarItem from "@components/navigation/SidebarItem"
import Popup from "@common/Popup"

type SidebarLinksProps = {
  children?: React.ReactNode
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ children }) => {
  return (
    <div>
      <div className={classes.sidebarLinksPopup}>
        <Popup toggle={<SidebarLinksToggle />} placement="right">
          <SidebarLinksList>
            {children}
          </SidebarLinksList>
        </Popup>
      </div>

      <div className={classes.sidebarLinksFlow}>
        <SidebarItem as="div" isStatic>
          <SidebarLinksList>
            {children}
          </SidebarLinksList>
        </SidebarItem>
      </div>
    </div>
  )
}

export default SidebarLinks
