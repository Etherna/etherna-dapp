import React, { createContext, useContext, useReducer } from "react"

const DropDownContext = createContext()

export const ReducerTypes = {
    PUSH_MENU: "PUSH_MENU",
    POP_MENU: "POP_MENU",
    CLEAR: "CLEAR",
}

const reducer = (state, action) => {
    switch (action.type) {
        case ReducerTypes.PUSH_MENU: {
            let history = state.history.slice()
            history.push(action.menuRef)
            return {
                ...state,
                history: history,
                current: action.menuRef
            }
        }
        case ReducerTypes.POP_MENU: {
            let history = state.history.slice()
            history.splice(action.index, 1)
            const current = action.index > 0 ? history[action.index-1] : undefined
            return {
                ...state,
                history,
                current
            }
        }
        case ReducerTypes.CLEAR:
            return {
                history: [],
                current: undefined
            }
        default:
            return state
    }
}

export const DropDownContextProvider = ({ children }) => {
    let store = useReducer(reducer, {
        history: [],
        current: undefined
    })
    return (
        <DropDownContext.Provider value={store}>
            {children}
        </DropDownContext.Provider>
    )
}

export const useStateValue = () => useContext(DropDownContext)