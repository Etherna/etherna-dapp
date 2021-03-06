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

import React from "react"
import { Shortcuts } from "react-shortcuts"

import { useStateValue, ReducerTypes } from "./PlayerContext"
import { PlayerActions } from "@keyboard"

type PlayerShortcutsProps = {
  children: React.ReactNode
}

const PlayerShortcuts = ({ children }: PlayerShortcutsProps) => {
  const [state, dispatch] = useStateValue()
  const { isPlaying, muted } = state

  const handleShortcut = (action: string, event: Event) => {
    event.preventDefault()
    event.stopPropagation()
    // eslint-disable-next-line default-case
    switch (action) {
      case PlayerActions.PLAYPAUSE:
        dispatch({
          type: ReducerTypes.TOGGLE_PLAY,
          isPlaying: !isPlaying,
        })
        break
      case PlayerActions.SKIP_BACKWARD:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, bySec: -5 })
        break
      case PlayerActions.SKIP_FORWARD:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, bySec: 5 })
        break
      // TODO: Enable when captions available
      // case PlayerActions.CAPTIONS:
      //     dispatch({ type: ReducerTypes.TOGGLE_CAPTIONS })
      //     break
      case PlayerActions.FULL_SCREEN:
        dispatch({ type: ReducerTypes.TOGGLE_FULLSCREEN })
        break
      case PlayerActions.PICTURE_IN_PICTURE:
        dispatch({ type: ReducerTypes.TOGGLE_PICTURE_IN_PICTURE })
        break
      // TODO: Enable when mini player available
      // case PlayerActions.MINI_PLAYER:
      //     dispatch({ type: ReducerTypes.TOGGLE_MINI_PLAYER })
      //     break
      case PlayerActions.MUTE:
        dispatch({ type: ReducerTypes.TOGGLE_MUTED, muted: !muted })
        break
      case PlayerActions.VOLUME_UP:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, byPercent: 0.05 })
        break
      case PlayerActions.VOLUME_DOWN:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, byPercent: -0.05 })
        break
      case PlayerActions.VOLUME_10_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.1 })
        break
      case PlayerActions.VOLUME_20_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.2 })
        break
      case PlayerActions.VOLUME_30_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.3 })
        break
      case PlayerActions.VOLUME_40_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.4 })
        break
      case PlayerActions.VOLUME_50_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.5 })
        break
      case PlayerActions.VOLUME_60_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.6 })
        break
      case PlayerActions.VOLUME_70_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.7 })
        break
      case PlayerActions.VOLUME_80_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.8 })
        break
      case PlayerActions.VOLUME_90_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_VOLUME, atPercent: 0.9 })
        break
      case PlayerActions.SKIP_10_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.1 })
        break
      case PlayerActions.SKIP_20_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.2 })
        break
      case PlayerActions.SKIP_30_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.3 })
        break
      case PlayerActions.SKIP_40_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.4 })
        break
      case PlayerActions.SKIP_50_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.5 })
        break
      case PlayerActions.SKIP_60_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.6 })
        break
      case PlayerActions.SKIP_70_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.7 })
        break
      case PlayerActions.SKIP_80_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.8 })
        break
      case PlayerActions.SKIP_90_PERCENT:
        dispatch({ type: ReducerTypes.UPDATE_PROGRESS, atPercent: 0.9 })
        break
    }
  }

  return (
    <div className="shortcuts-handler">
      <Shortcuts name="PLAYER" handler={handleShortcut} global={true} targetNodeSelector="body">
        {children}
      </Shortcuts>
    </div>
  )
}

export default PlayerShortcuts
