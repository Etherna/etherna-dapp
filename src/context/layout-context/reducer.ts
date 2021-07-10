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
