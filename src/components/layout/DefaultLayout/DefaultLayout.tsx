import React, { useEffect } from "react"

import "./layout.scss"

import { LayoutContextProvider, useStateValue } from "./LayoutContext"
import Header from "@components/layout/Header"
import Sidebar from "@components/layout/Sidebar"
import Modals from "@components/modals/ModalsSection"
import { providerActions } from "@state/actions"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutContextProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutContextProvider>
  )
}

const LayoutContent = ({ children }: LayoutProps) => {
  const [state] = useStateValue()
  const { emptyLayout, hideSidebar } = state

  useEffect(() => {
    !emptyLayout && providerActions.signin()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
