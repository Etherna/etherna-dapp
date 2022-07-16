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
import { useLocation } from "react-router-dom"

import classes from "@/styles/components/navigation/SidebarLogo.module.scss"

import SidebarItem from "@/components/navigation/SidebarItem"

type SidebarLogoProps = {
  className?: string
  logo: React.ReactNode
  logoCompact?: React.ReactNode
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ className, logo, logoCompact }) => {
  const { pathname } = useLocation()

  const dispatchRefresh = () => {
    if (pathname !== "/") return
    window.dispatchEvent(new Event("refresh"))
  }

  return (
    <SidebarItem className={className} to="/" isStatic>
      <figure className={classes.sidebarLogo} onClick={dispatchRefresh}>
        {logoCompact && (
          <div className={classes.sidebarLogoMobile}>{logoCompact}</div>
        )}
        <div className={classes.sidebarLogoDefault}>{logo}</div>
      </figure>
    </SidebarItem>
  )
}

export default SidebarLogo
