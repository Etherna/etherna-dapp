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
import { NavLink } from "react-router-dom"

import SwarmImg from "@common/SwarmImg"
import makeBlockies from "@utils/makeBlockies"
import SwarmImage from "@classes/SwarmImage"

type SidebarItemProps = {
  image: string | SwarmImage | undefined
  fallbackAddress?: string
  name: string
  link: string
}

const SidebarItem = ({ image, fallbackAddress, name, link }: SidebarItemProps) => {
  return (
    <NavLink to={link} activeClassName="active" className="sidebar-item">
      <SwarmImg
        image={image}
        fallback={makeBlockies(fallbackAddress)}
        className="sidebar-item-image"
        style={{}}
      />
      <div className="sidebar-item-title">{name}</div>
    </NavLink>
  )
}

export default SidebarItem
