import React, { createContext, useContext, useReducer } from "react"

const LayoutContext = createContext<LayoutContextStore | undefined>(undefined)

// Types
type LayoutContextStore = [state: LayoutContextState, dispatch: React.Dispatch<AnyAction>]

type LayoutContextState = {
  emptyLayout: boolean
  hideSidebar: boolean
  floatingSidebar: boolean
}

// Actions
export const ReducerTypes = {
  SET_EMPTY_LAYOUT: "SET_EMPTY_LAYOUT",
  SET_HIDE_SIDEBAR: "SET_HIDE_SIDEBAR",
  SET_FLOATING_SIDEBAR: "SET_FLOATING_SIDEBAR",
} as const

type SetEmptyLayoutAction = {
  type: typeof ReducerTypes.SET_EMPTY_LAYOUT,
  emptyLayout: boolean
}
type SetHideSidebarAction = {
  type: typeof ReducerTypes.SET_HIDE_SIDEBAR,
  hideSidebar: boolean
}
type SetFloatingSidebarAction = {
  type: typeof ReducerTypes.SET_FLOATING_SIDEBAR,
  floatingSidebar: boolean
}
type AnyAction = SetEmptyLayoutAction | SetHideSidebarAction | SetFloatingSidebarAction

// Reducer
const reducer = (state: LayoutContextState, action: AnyAction): LayoutContextState => {
  switch (action.type) {
    case ReducerTypes.SET_EMPTY_LAYOUT: {
      return {
        ...state,
        emptyLayout: action.emptyLayout,
      }
    }
    case ReducerTypes.SET_HIDE_SIDEBAR: {
      return {
        ...state,
        hideSidebar: action.hideSidebar,
      }
    }
    case ReducerTypes.SET_FLOATING_SIDEBAR: {
      return {
        ...state,
        floatingSidebar: action.floatingSidebar,
      }
    }
    default:
      return state
  }
}

// Wrapper
type LayoutContextProviderProps = {
  children: React.ReactNode
}
export const LayoutContextProvider = ({ children }: LayoutContextProviderProps) => {
  const store = useReducer(reducer, {
    emptyLayout: false,
    hideSidebar: false,
    floatingSidebar: false,
  })
  return (
    <LayoutContext.Provider value={store}>
      {children}
    </LayoutContext.Provider>
  )
}

// Hooks
export const useStateValue = () => useContext(LayoutContext)!
