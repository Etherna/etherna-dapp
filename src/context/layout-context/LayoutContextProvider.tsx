import React, { useReducer } from "react"

import { LayoutContext } from "."
import layoutReducer from "./reducer"
import logger from "@utils/context-logger"

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
  const stateReducer = import.meta.env.DEV ? logger(layoutReducer) : layoutReducer
  const store = useReducer(stateReducer, {
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
