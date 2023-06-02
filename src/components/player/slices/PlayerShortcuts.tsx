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

import React, { memo, useCallback } from "react"

import useShortcuts from "@/hooks/useShortcuts"
import { PlayerActions } from "@/keyboard"
import usePlayerStore from "@/stores/player"
import useSettingsStore from "@/stores/settings"
import { clamp } from "@/utils/math"

type PlayerShortcutsProps = {
  children?: React.ReactNode
}

const PlayerShortcuts: React.FC<PlayerShortcutsProps> = ({ children }) => {
  const keymap = useSettingsStore(state => state.keymap)
  const currentTime = usePlayerStore(state => state.currentTime)
  const duration = usePlayerStore(state => state.duration)
  const volume = usePlayerStore(state => state.volume)
  const setCurrentTime = usePlayerStore(state => state.setCurrentTime)
  const setVolume = usePlayerStore(state => state.setVolume)
  const togglePlay = usePlayerStore(state => state.togglePlay)
  const toggleFullScreen = usePlayerStore(state => state.toggleFullScreen)
  const togglePiP = usePlayerStore(state => state.togglePiP)
  const toggleMute = usePlayerStore(state => state.toggleMute)

  const handleShortcut = (action: string) => {
    switch (action) {
      case PlayerActions.PLAYPAUSE:
        togglePlay()
        break
      case PlayerActions.SKIP_BACKWARD:
        setCurrentTime(clamp(currentTime - 5, 0, duration))
        break
      case PlayerActions.SKIP_FORWARD:
        setCurrentTime(clamp(currentTime + 5, 0, duration))
        break
      // TODO: Enable when captions available
      // case PlayerActions.CAPTIONS:
      //     dispatch({ type: PlayerReducerTypes.TOGGLE_CAPTIONS })
      //     break
      case PlayerActions.FULL_SCREEN:
        toggleFullScreen()
        break
      case PlayerActions.PICTURE_IN_PICTURE:
        togglePiP()
        break
      // TODO: Enable when mini player available
      // case PlayerActions.MINI_PLAYER:
      //     dispatch({ type: PlayerReducerTypes.TOGGLE_MINI_PLAYER })
      //     break
      case PlayerActions.MUTE:
        toggleMute()
        break
      case PlayerActions.VOLUME_UP:
        setVolume(clamp(volume + 0.05, 0, 1))
        break
      case PlayerActions.VOLUME_DOWN:
        setVolume(clamp(volume - 0.05, 0, 1))
        break
      case PlayerActions.VOLUME_10_PERCENT:
        setVolume(0.1)
        break
      case PlayerActions.VOLUME_20_PERCENT:
        setVolume(0.2)
        break
      case PlayerActions.VOLUME_30_PERCENT:
        setVolume(0.3)
        break
      case PlayerActions.VOLUME_40_PERCENT:
        setVolume(0.4)
        break
      case PlayerActions.VOLUME_50_PERCENT:
        setVolume(0.5)
        break
      case PlayerActions.VOLUME_60_PERCENT:
        setVolume(0.6)
        break
      case PlayerActions.VOLUME_70_PERCENT:
        setVolume(0.7)
        break
      case PlayerActions.VOLUME_80_PERCENT:
        setVolume(0.8)
        break
      case PlayerActions.VOLUME_90_PERCENT:
        setVolume(0.9)
        break
      case PlayerActions.SKIP_10_PERCENT:
        setCurrentTime(duration * 0.1)
        break
      case PlayerActions.SKIP_20_PERCENT:
        setCurrentTime(duration * 0.2)
        break
      case PlayerActions.SKIP_30_PERCENT:
        setCurrentTime(duration * 0.3)
        break
      case PlayerActions.SKIP_40_PERCENT:
        setCurrentTime(duration * 0.4)
        break
      case PlayerActions.SKIP_50_PERCENT:
        setCurrentTime(duration * 0.5)
        break
      case PlayerActions.SKIP_60_PERCENT:
        setCurrentTime(duration * 0.6)
        break
      case PlayerActions.SKIP_70_PERCENT:
        setCurrentTime(duration * 0.7)
        break
      case PlayerActions.SKIP_80_PERCENT:
        setCurrentTime(duration * 0.8)
        break
      case PlayerActions.SKIP_90_PERCENT:
        setCurrentTime(duration * 0.9)
        break
    }
  }

  useShortcuts(keymap.PLAYER, handleShortcut)

  return <div>{children}</div>
}

export default memo(PlayerShortcuts)
