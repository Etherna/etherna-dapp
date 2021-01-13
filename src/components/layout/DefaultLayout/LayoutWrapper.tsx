import React from "react"
import { useEffect } from "react"

import { useStateValue, ReducerTypes } from "./LayoutContext"

type LayoutWrapperProps = {
  children: React.ReactNode
  hideSidebar?: boolean
  emptyLayout?: boolean
}

const LayoutWrapper = ({ children, hideSidebar = false, emptyLayout = false }: LayoutWrapperProps) => {
  // eslint-disable-next-line no-unused-vars
  const [,dispatch] = useStateValue()

  useEffect(() => {
    dispatch({
      type: ReducerTypes.SET_EMPTY_LAYOUT,
      emptyLayout,
    })
    dispatch({
      type: ReducerTypes.SET_HIDE_SIDEBAR,
      hideSidebar,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

export default LayoutWrapper
