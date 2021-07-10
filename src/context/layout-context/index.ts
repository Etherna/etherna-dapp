import { createContext } from "react"
import { LayoutContextStore } from "./types"

export const LayoutContext = createContext<LayoutContextStore | undefined>(undefined)

// forward exports
export { default as LayoutContextProvider } from "./LayoutContextProvider"
export { LayoutReducerTypes } from "./reducer"
export type { AnyLayoutAction } from "./reducer"
export type { LayoutContextStore, LayoutContextState } from "./types"
