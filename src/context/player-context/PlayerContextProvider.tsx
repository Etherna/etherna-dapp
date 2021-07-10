import React, { useReducer } from "react"

import { PlayerContext } from "."
import playerContextReducer from "./reducer"

const PlayerContextProvider: React.FC = ({ children }) => {
  const store = useReducer(playerContextReducer, {
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
