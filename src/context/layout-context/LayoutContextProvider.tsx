import React, { useReducer } from "react"

import { LayoutContext } from "."
import layoutReducer from "./reducer"

type LayoutContextProviderProps = {
  emptyLayout?: boolean
  hideSidebar?: boolean
  floatingSidebar?: boolean
}

const LayoutContextProvider: React.FC<LayoutContextProviderProps> = ({
  children,
  emptyLayout = false,
  hideSidebar = false,
  floatingSidebar = false,
}) => {
  const store = useReducer(layoutReducer, {
    emptyLayout,
    hideSidebar,
    floatingSidebar,
  })

  return (
    <LayoutContext.Provider value={store}>
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContextProvider
