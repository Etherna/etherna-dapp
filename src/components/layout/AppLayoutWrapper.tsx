/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useLayoutEffect, useState } from "react"

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

  useLayoutEffect(() => {
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
