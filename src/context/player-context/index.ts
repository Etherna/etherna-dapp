import { createContext } from "react"
import { PlayerContextStore } from "./types"

export const PlayerContext = createContext<PlayerContextStore | undefined>(undefined)

// forward exports
export { default as PlayerContextProvider } from "./PlayerContextProvider"
export { PlayerReducerTypes } from "./reducer"
export type { AnyPlayerAction } from "./reducer"
export type { PlayerContextStore, PlayerContextState } from "./types"
