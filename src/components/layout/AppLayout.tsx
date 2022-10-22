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

import Popups from "@/components/layout/Popups"
import SidebarNavigation from "@/components/layout/SidebarNavigation"
import TabbarNavigation from "@/components/layout/TabbarNavigation"
import TopbarNavigation from "@/components/layout/TopbarNavigation"
import Modals from "@/components/modals/ModalsSection"
import usePageTracking from "@/hooks/usePageTracking"
import useUIStore from "@/stores/ui"

type AppLayoutProps = {
  children?: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  usePageTracking()
  const floatingSidebar = useUIStore(state => state.floatingSidebar)

  return (
    <>
      <div className="flex w-full flex-wrap" data-sidebar-floating={`${floatingSidebar}`}>
        <SidebarNavigation />

        <div className="z-0 flex-grow">
          <TopbarNavigation />
          <TabbarNavigation />
          <main className="w-full overflow-x-hidden">{children}</main>
        </div>
      </div>

      <Modals />

      <Popups />
    </>
  )
}

export default AppLayout
