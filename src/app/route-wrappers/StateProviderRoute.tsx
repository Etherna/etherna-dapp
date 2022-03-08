import React from "react"
import { Outlet } from "react-router-dom"

import ShortcutWrapper from "@keyboard/shortcutWrapper"
import StateProviderWrapper from "@state/StateProviderWrapper"

const StateProviderRoute: React.FC = () => {
  return (
    <StateProviderWrapper>
      <ShortcutWrapper>
        <Outlet />
      </ShortcutWrapper>
    </StateProviderWrapper>
  )
}

export default StateProviderRoute
