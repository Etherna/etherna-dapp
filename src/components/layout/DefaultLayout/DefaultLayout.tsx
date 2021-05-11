import React from "react"

import "./layout.scss"

import { LayoutContextProvider, useStateValue } from "./LayoutContext"
import Header from "@components/layout/Header"
import Sidebar from "@components/layout/Sidebar"
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
  const { emptyLayout, hideSidebar } = state

  if (emptyLayout) {
    return <main>{children}</main>
  }

  return (
    <>
      <Header />
      {!hideSidebar && <Sidebar />}
      <main>{children}</main>
      <Modals />
    </>
  )
}

export default Layout
