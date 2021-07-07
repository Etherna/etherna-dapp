import React from "react"
import { useEffect } from "react"

import { useStateValue, ReducerTypes } from "./LayoutContext"

type LayoutWrapperProps = {
  children: React.ReactNode
  hideSidebar?: boolean
  floatingSidebar?: boolean
  emptyLayout?: boolean
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  hideSidebar = false,
  floatingSidebar = false,
  emptyLayout = false
}) => {
  const [, dispatch] = useStateValue()

  useEffect(() => {
    dispatch({
      type: ReducerTypes.SET_EMPTY_LAYOUT,
      emptyLayout,
    })
    dispatch({
      type: ReducerTypes.SET_HIDE_SIDEBAR,
      hideSidebar,
    })
    dispatch({
      type: ReducerTypes.SET_FLOATING_SIDEBAR,
      floatingSidebar,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

export default LayoutWrapper
