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
 *  
 */

import React, { useReducer } from "react"

import { PlayerContext } from "."
import playerContextReducer from "./reducer"
import logger from "@utils/context-logger"

const PlayerContextProvider: React.FC = ({ children }) => {
  const stateReducer = import.meta.env.DEV ? logger(playerContextReducer) : playerContextReducer
  const store = useReducer(stateReducer, {
    videoEl: undefined,
    sourceQualities: [],
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
