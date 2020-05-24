import React, { createContext, useContext, useReducer } from "react"

const LayoutContext = createContext()

export const ReducerTypes = {
    SET_EMPTY_LAYOUT: "SET_EMPTY_LAYOUT",
    SET_HIDE_SIDEBAR: "SET_HIDE_SIDEBAR",
}

const reducer = (state, action) => {
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
        default:
            return state
    }
}

export const LayoutContextProvider = ({ children }) => {
    let store = useReducer(reducer, {
        emptyLayout: false,
        hideSidebar: false,
    })
    return (
        <LayoutContext.Provider value={store}>
            {children}
        </LayoutContext.Provider>
    )
}

export const useStateValue = () => useContext(LayoutContext)
