import React from "react"

import "./layout.scss"

import { LayoutContextProvider, useStateValue } from "./LayoutContext"
import SidebarNavigation from "@components/layout/SidebarNavigation"
import TopbarNavigation from "@components/layout/TopbarNavigation"
import TabbarNavigation from "@components/layout/TabbarNavigation"
import Modals from "@components/modals/ModalsSection"

const Layout: React.FC = ({ children }) => {
  return (
    <LayoutContextProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutContextProvider>
  )
}

const LayoutContent: React.FC = ({ children }) => {
  const [state] = useStateValue()
  const { emptyLayout } = state

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
    </>
  )
}

export default Layout
