import React, { createContext, Dispatch, useContext, useReducer } from "react"

const DropDownContext = createContext<DropDownContextStore | undefined>(undefined)

// Types
export type DropDownContextStore = [state: DropDownContextState, dispatch: Dispatch<AnyActions>]

export type DropDownContextState = {
  history: React.MutableRefObject<any>[]
  current?: React.MutableRefObject<any>
}

// Actions
export const ReducerTypes = {
  PUSH_MENU: "PUSH_MENU",
  POP_MENU: "POP_MENU",
  CLEAR: "CLEAR",
} as const

type PushMenuAction = {
  type: typeof ReducerTypes.PUSH_MENU
  menuRef: React.MutableRefObject<any>
}
type PopMenuAction = {
  type: typeof ReducerTypes.POP_MENU
  index: number
}
type ClearAction = {
  type: typeof ReducerTypes.CLEAR
}
type AnyActions = PushMenuAction | PopMenuAction | ClearAction

// Reducer
const reducer = (state: DropDownContextState, action: AnyActions): DropDownContextState => {
  switch (action.type) {
    case ReducerTypes.PUSH_MENU: {
      let history = state.history.slice()
      history.push(action.menuRef)
      return {
        ...state,
        history: history,
        current: action.menuRef,
      }
    }
    case ReducerTypes.POP_MENU: {
      let history = state.history.slice()
      history.splice(action.index, 1)
      const current = action.index > 0 ? history[action.index - 1] : undefined
      return {
        ...state,
        history,
        current,
      }
    }
    case ReducerTypes.CLEAR:
      return {
        history: [],
        current: undefined,
      }
    default:
      return state
  }
}

// Wrapper
type DropDownContextProviderProps = {
  children: React.ReactNode
}

export const DropDownContextProvider = ({ children }: DropDownContextProviderProps) => {
  const store = useReducer(reducer, {
    history: [],
    current: undefined,
  } as DropDownContextState)
  return (
    <DropDownContext.Provider value={store}>
      {children}
    </DropDownContext.Provider>
  )
}

// Hooks
export const useStateValue = () => useContext(DropDownContext)!
