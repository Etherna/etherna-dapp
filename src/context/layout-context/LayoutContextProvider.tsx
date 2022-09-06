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
import React, { useReducer } from "react"

import { LayoutContext } from "."
import layoutReducer from "./reducer"
import logger from "@/utils/context-logger"

type LayoutContextProviderProps = {
  children?: React.ReactNode
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

  return <LayoutContext.Provider value={store}>{children}</LayoutContext.Provider>
}

export default LayoutContextProvider
