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
