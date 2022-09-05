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
import { SparklesIcon, UserCircleIcon, FilmIcon, CashIcon } from "@heroicons/react/solid"

import SEO from "./SEO"
import DropdownSidebar from "@/components/navigation/DropdownSidebar"
import SidebarItem from "@/components/navigation/SidebarItem"
import { Container } from "@/components/ui/layout"
import routes from "@/routes"

type StudioLayoutProps = {
  children?: React.ReactNode
}

const StudioLayout: React.FC<StudioLayoutProps> = ({ children }) => {
  return (
    <Container fluid>
      <SEO title="Creator Studio" />

      <h1 className="flex items-center">
        <SparklesIcon className="h-[1em] mr-2" aria-hidden /> Creator Studio
      </h1>

      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6 xl:space-x-14">
        <DropdownSidebar className="lg:self-start lg:sticky lg:top-20">
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
            iconSvg={<UserCircleIcon />}
            isActive={pathname => /\/studio\/channel/.test(pathname)}
            isResponsive={false}
          />
          <SidebarItem
            to={routes.studioPostages}
            title="Postages"
            iconSvg={<CashIcon />}
            isActive={pathname => /\/studio\/postages/.test(pathname)}
            isResponsive={false}
          />
        </DropdownSidebar>

        {children}
      </div>
    </Container>
  )
}

export default StudioLayout
