import React from "react"

import "./app-layout.scss"

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
      <div className="app-layout">

        <SidebarNavigation />

        <main>
          <TopbarNavigation />
          <TabbarNavigation />

          <div className="container-fluid main">
            {children}
          </div>
        </main>

      </div>

      <Modals />

      <Popups />
    </>
  )
}

export default AppLayout
