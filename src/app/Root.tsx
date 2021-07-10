import React from "react"
import { BrowserRouter } from "react-router-dom"

import "./scss/theme.scss"

import Router from "./Router"
import AppLayout from "@components/layout/AppLayout"
import ShortcutWrapper from "@keyboard/shortcutWrapper"
import StateWrapper from "@state/wrapper"
import useAutoSignin from "@state/hooks/user/useAutoSignin"
import { getBasename } from "@routes"

const Root: React.FC = () => {
  useAutoSignin({
    isStatusPage: /^\/404/.test(window.location.pathname)
  })

  return (
    <BrowserRouter basename={getBasename()}>
      <AppLayout>
        <Router />
      </AppLayout>
    </BrowserRouter>
  )
}

const StateRoot: React.FC = () => (
  <StateWrapper>
    <ShortcutWrapper>
      <Root />
    </ShortcutWrapper>
  </StateWrapper>
)

export default StateRoot
