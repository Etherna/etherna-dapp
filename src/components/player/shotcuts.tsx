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

import React, { memo } from "react"
import { useMediaPlayer, useMediaRemote } from "@vidstack/react"

import useShortcuts from "@/hooks/useShortcuts"
import { PlayerActions } from "@/keyboard"
import useSettingsStore from "@/stores/settings"
import { clamp } from "@/utils/math"

import type { PropsWithChildren } from "react"

export const PlayerShortcuts = memo(({ children }: PropsWithChildren) => {
  const keymap = useSettingsStore(state => state.keymap)
  const player = useMediaPlayer()
  const remote = useMediaRemote()

  const handleShortcut = (action: string) => {
    if (!player) return

    switch (action) {
      case PlayerActions.PLAYPAUSE:
        remote.togglePaused()
        break
      case PlayerActions.SKIP_BACKWARD:
        remote.seek(clamp(player.currentTime - 5, 0, player.state.duration))
        break
      case PlayerActions.SKIP_FORWARD:
        remote.seek(clamp(player.currentTime + 5, 0, player.state.duration))
        break
      case PlayerActions.CAPTIONS:
        remote.toggleCaptions()
        break
      case PlayerActions.FULL_SCREEN:
        remote.toggleFullscreen()
        break
      case PlayerActions.PICTURE_IN_PICTURE:
        remote.togglePictureInPicture()
        break
      // TODO: Enable when mini player available
      // case PlayerActions.MINI_PLAYER:
      //     dispatch({ type: PlayerReducerTypes.TOGGLE_MINI_PLAYER })
      //     break
      case PlayerActions.MUTE:
        remote.toggleMuted()
        break
      case PlayerActions.VOLUME_UP:
        remote.changeVolume(clamp(player.volume + 0.05, 0, 1))
        break
      case PlayerActions.VOLUME_DOWN:
        remote.changeVolume(clamp(player.volume - 0.05, 0, 1))
        break
      case PlayerActions.VOLUME_10_PERCENT:
        remote.changeVolume(0.1)
        break
      case PlayerActions.VOLUME_20_PERCENT:
        remote.changeVolume(0.2)
        break
      case PlayerActions.VOLUME_30_PERCENT:
        remote.changeVolume(0.3)
        break
      case PlayerActions.VOLUME_40_PERCENT:
        remote.changeVolume(0.4)
        break
      case PlayerActions.VOLUME_50_PERCENT:
        remote.changeVolume(0.5)
        break
      case PlayerActions.VOLUME_60_PERCENT:
        remote.changeVolume(0.6)
        break
      case PlayerActions.VOLUME_70_PERCENT:
        remote.changeVolume(0.7)
        break
      case PlayerActions.VOLUME_80_PERCENT:
        remote.changeVolume(0.8)
        break
      case PlayerActions.VOLUME_90_PERCENT:
        remote.changeVolume(0.9)
        break
      case PlayerActions.SKIP_10_PERCENT:
        remote.seek(player.state.duration * 0.1)
        break
      case PlayerActions.SKIP_20_PERCENT:
        remote.seek(player.state.duration * 0.2)
        break
      case PlayerActions.SKIP_30_PERCENT:
        remote.seek(player.state.duration * 0.3)
        break
      case PlayerActions.SKIP_40_PERCENT:
        remote.seek(player.state.duration * 0.4)
        break
      case PlayerActions.SKIP_50_PERCENT:
        remote.seek(player.state.duration * 0.5)
        break
      case PlayerActions.SKIP_60_PERCENT:
        remote.seek(player.state.duration * 0.6)
        break
      case PlayerActions.SKIP_70_PERCENT:
        remote.seek(player.state.duration * 0.7)
        break
      case PlayerActions.SKIP_80_PERCENT:
        remote.seek(player.state.duration * 0.8)
        break
      case PlayerActions.SKIP_90_PERCENT:
        remote.seek(player.state.duration * 0.9)
        break
    }
  }

  useShortcuts(keymap.PLAYER, handleShortcut)

  return <>{children}</>
})
