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

import classes from "@styles/components/layout/AppLayout.module.scss"

import SidebarNavigation from "@components/layout/SidebarNavigation"
import TopbarNavigation from "@components/layout/TopbarNavigation"
import TabbarNavigation from "@components/layout/TabbarNavigation"
import Popups from "@components/layout/Popups"
import Modals from "@components/modals/ModalsSection"
import { LayoutContextProvider } from "@context/layout-context"
import { useLayoutState } from "@context/layout-context/hooks"

const AppLayout: React.FC = ({ children }) => {
  return (
    <LayoutContextProvider>
      <AppLayoutContent>
        {children}
      </AppLayoutContent>
    </LayoutContextProvider>
  )
}

const AppLayoutContent: React.FC = ({ children }) => {
  const [{ emptyLayout }] = useLayoutState()

  if (emptyLayout) {
    return <main>{children}</main>
  }

  return (
    <>
      <div className={classes.appLayout}>

        <SidebarNavigation />

        <div className={classes.main}>
          <TopbarNavigation />
          <TabbarNavigation />

          <main>
            {children}
          </main>
        </div>

      </div>

      <Modals />

      <Popups />
    </>
  )
}

export default AppLayout
