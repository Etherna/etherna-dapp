import React, { useEffect, useState } from "react"

import { LayoutReducerTypes } from "@context/layout-context"
import { useLayoutState } from "@context/layout-context/hooks"

type AppLayoutWrapperProps = {
  emptyLayout?: boolean
  hideSidebar?: boolean
  floatingSidebar?: boolean
}

const AppLayoutWrapper: React.FC<AppLayoutWrapperProps> = ({
  children,
  emptyLayout = false,
  hideSidebar = false,
  floatingSidebar = false,
}) => {
  const [, dispatch] = useLayoutState()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    dispatch({
      type: LayoutReducerTypes.SET_EMPTY_LAYOUT,
      emptyLayout,
    })
    dispatch({
      type: LayoutReducerTypes.SET_SIDEBAR_HIDDEN,
      hideSidebar,
    })
    dispatch({
      type: LayoutReducerTypes.SET_FLOATING_SIDEBAR,
      floatingSidebar,
    })

    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!loaded) return null

  return (
    <>
      {children}
    </>
  )
}

export default AppLayoutWrapper
