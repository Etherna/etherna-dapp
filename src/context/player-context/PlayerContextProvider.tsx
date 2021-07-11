import React, { useReducer } from "react"

import { PlayerContext } from "."
import playerContextReducer from "./reducer"
import logger from "@utils/context-logger"

const PlayerContextProvider: React.FC = ({ children }) => {
  const stateReducer = import.meta.env.DEV ? logger(playerContextReducer) : playerContextReducer
  const store = useReducer(stateReducer, {
    videoEl: undefined,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    buffering: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
  })


  return (
    <PlayerContext.Provider value={store}>
      {children}
    </PlayerContext.Provider>
  )
}

export default PlayerContextProvider
