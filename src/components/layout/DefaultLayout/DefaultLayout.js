import React, { useEffect } from "react"
import PropTypes from "prop-types"

import "./layout.scss"
import { LayoutContextProvider, useStateValue } from "./LayoutContext"
import Header from "@components/layout/Header"
import Sidebar from "@components/layout/Sidebar"
import Modals from "@components/modals/ModalsSection"
import { providerActions } from "@state/actions"

const Layout = ({ children }) => {
  return (
    <LayoutContextProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutContextProvider>
  )
}

const LayoutContent = ({ children }) => {
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

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
