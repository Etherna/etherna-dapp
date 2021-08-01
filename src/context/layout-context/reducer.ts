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
 */

import { LayoutContextState } from "./types"

// Actions
export const LayoutReducerTypes = {
  SET_EMPTY_LAYOUT: "layout/set-empty-layout",
  SET_SIDEBAR_HIDDEN: "layout/set-sidbar-hidden",
  SET_FLOATING_SIDEBAR: "layout/set-floating-sidebar",
} as const

type SetEmptyLayoutAction = {
  type: typeof LayoutReducerTypes.SET_EMPTY_LAYOUT,
  emptyLayout: boolean
}
type SetHideSidebarAction = {
  type: typeof LayoutReducerTypes.SET_SIDEBAR_HIDDEN,
  hideSidebar: boolean
}
type SetFloatingSidebarAction = {
  type: typeof LayoutReducerTypes.SET_FLOATING_SIDEBAR,
  floatingSidebar: boolean
}

export type AnyLayoutAction = SetEmptyLayoutAction | SetHideSidebarAction | SetFloatingSidebarAction

// Reducer
const layoutReducer = (state: LayoutContextState, action: AnyLayoutAction): LayoutContextState => {
  switch (action.type) {
    case LayoutReducerTypes.SET_EMPTY_LAYOUT: {
      return {
        ...state,
        emptyLayout: action.emptyLayout,
      }
    }
    case LayoutReducerTypes.SET_SIDEBAR_HIDDEN: {
      return {
        ...state,
        hideSidebar: action.hideSidebar,
      }
    }
    case LayoutReducerTypes.SET_FLOATING_SIDEBAR: {
      return {
        ...state,
        floatingSidebar: action.floatingSidebar,
      }
    }
    default:
      return state
  }
}

export default layoutReducer
