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

import classes from "@/styles/components/layout/StudioLayout.module.scss"
import { SparklesIcon, LightBulbIcon, FilmIcon, ServerIcon } from "@heroicons/react/solid"

import SEO from "./SEO"
import Container from "@/components/common/Container"
import DropdownSidebar from "@/components/navigation/DropdownSidebar"
import SidebarItem from "@/components/navigation/SidebarItem"
import routes from "@/routes"

type StudioLayoutProps = {
  children?: React.ReactNode
}

const StudioLayout: React.FC<StudioLayoutProps> = ({ children }) => {
  return (
    <Container fluid>
      <SEO title="Creator Studio" />

      <h1 className={classes.title}><SparklesIcon /> Creator Studio</h1>

      <div className={classes.content}>
        <DropdownSidebar>
          <SidebarItem
            to={routes.studioVideos}
            title="Videos"
            iconSvg={<FilmIcon />}
            isActive={pathname => /\/studio\/videos/.test(pathname)}
            isResponsive={false}
          />
          <SidebarItem
            to={routes.studioChannel}
            title="Customize"
            iconSvg={<LightBulbIcon />}
            isActive={pathname => /\/studio\/channel/.test(pathname)}
            isResponsive={false}
          />
          <SidebarItem
            to={routes.studioStorage}
            title="Storage"
            iconSvg={<ServerIcon />}
            isActive={pathname => /\/studio\/storage/.test(pathname)}
            isResponsive={false}
          />
        </DropdownSidebar>
        {children}
      </div>
    </Container>
  )
}

export default StudioLayout
