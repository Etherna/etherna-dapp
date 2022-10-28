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
 */
import { clamp } from "@/utils/math"

import type { PlayerContextState } from "."

export const PlayerReducerTypes = {
  SET_VIDEO_ELEMENT: "player/set-video-element",
  SET_SOURCE: "player/set-source",
  SET_SOURCE_QUALITIES: "player/set-source-qualities",
  SET_CURRENT_QUALITY: "player/set-current-quality",
  SET_PLAYBACK_ERROR: "player/set-playback-error",
  TOGGLE_PLAY: "player/toggle-play",
  RESET_PLAY: "player/reset-play",
  TOGGLE_FULLSCREEN: "player/toggle-fullscreen",
  TOGGLE_PICTURE_IN_PICTURE: "player/toggle-picture-in-picture",
  TOGGLE_MUTED: "player/toggle-muted",
  UPDATE_DURATION: "player/update-duration",
  UPDATE_PROGRESS: "player/update-progress",
  UPDATE_PLAYBACK_RATE: "player/update-playback-rate",
  UPDATE_VOLUME: "player/update-volume",
  REFRESH_CURRENT_TIME: "player/refresh-current-time",
  REFRESH_BUFFERING: "player/refresh-buffering",
} as const

type SetVideoElAction = {
  type: typeof PlayerReducerTypes.SET_VIDEO_ELEMENT
  videoEl: HTMLVideoElement
}
type SetSourceAction = {
  type: typeof PlayerReducerTypes.SET_SOURCE
  source: string
  size?: number
}
type SetSourceQualitiesAction = {
  type: typeof PlayerReducerTypes.SET_SOURCE_QUALITIES
  qualities: string[]
}
type SetCurrentQualityAction = {
  type: typeof PlayerReducerTypes.SET_CURRENT_QUALITY
  currentQuality: string
}
type SetPlaybackErrorAction = {
  type: typeof PlayerReducerTypes.SET_PLAYBACK_ERROR
  errorCode?: number
  errorMessage?: string
}
type TogglePlayAction = {
  type: typeof PlayerReducerTypes.TOGGLE_PLAY
  isPlaying: boolean
}
type ResetPlayAction = {
  type: typeof PlayerReducerTypes.RESET_PLAY
}
type ToggleFullScreenAction = {
  type: typeof PlayerReducerTypes.TOGGLE_FULLSCREEN
}
type TogglePiPAction = {
  type: typeof PlayerReducerTypes.TOGGLE_PICTURE_IN_PICTURE
}
type ToggleMutedAction = {
  type: typeof PlayerReducerTypes.TOGGLE_MUTED
  muted: boolean
}
type UpdateDurationAction = {
  type: typeof PlayerReducerTypes.UPDATE_DURATION
  duration: number
}
type UpdateProgressAction = {
  type: typeof PlayerReducerTypes.UPDATE_PROGRESS
  bySec?: number
  byPercent?: number
  atPercent?: number
}
type UpdatePlaybackRateAction = {
  type: typeof PlayerReducerTypes.UPDATE_PLAYBACK_RATE
  playbackRate: number
}
type UpdateVolumeAction = {
  type: typeof PlayerReducerTypes.UPDATE_VOLUME
  volume?: number
  byPercent?: number
  atPercent?: number
}
type RefreshCurrentTimeAction = {
  type: typeof PlayerReducerTypes.REFRESH_CURRENT_TIME
}
type RefreshBufferingAction = {
  type: typeof PlayerReducerTypes.REFRESH_BUFFERING
}

export type AnyPlayerAction =
  | SetVideoElAction
  | SetSourceAction
  | SetSourceQualitiesAction
  | SetCurrentQualityAction
  | SetPlaybackErrorAction
  | TogglePlayAction
  | ResetPlayAction
  | ToggleFullScreenAction
  | TogglePiPAction
  | ToggleMutedAction
  | UpdateDurationAction
  | UpdateProgressAction
  | UpdatePlaybackRateAction
  | UpdateVolumeAction
  | RefreshCurrentTimeAction
  | RefreshBufferingAction

const playerContextReducer = (
  state: PlayerContextState,
  action: AnyPlayerAction
): PlayerContextState => {
  switch (action.type) {
    case PlayerReducerTypes.SET_VIDEO_ELEMENT: {
      return {
        ...state,
        videoEl: action.videoEl,
      }
    }

    case PlayerReducerTypes.SET_SOURCE: {
      return {
        ...state,
        source: action.source,
        sourceSize: action.size,
      }
    }

    case PlayerReducerTypes.SET_SOURCE_QUALITIES: {
      return {
        ...state,
        sourceQualities: action.qualities,
      }
    }

    case PlayerReducerTypes.SET_CURRENT_QUALITY: {
      return {
        ...state,
        currentQuality: action.currentQuality,
      }
    }

    case PlayerReducerTypes.SET_PLAYBACK_ERROR: {
      const { errorCode, errorMessage } = action
      return {
        ...state,
        error:
          errorCode && errorMessage
            ? {
                code: errorCode,
                message: errorMessage,
              }
            : undefined,
      }
    }

    case PlayerReducerTypes.TOGGLE_PLAY: {
      if (action.isPlaying) {
        if (state.currentTime === 1 && state.videoEl) {
          state.videoEl.currentTime = 0
        }
        state.videoEl?.play()
      } else {
        state.videoEl?.pause()
      }
      return {
        ...state,
        isPlaying: !state.videoEl?.paused,
      }
    }

    case PlayerReducerTypes.RESET_PLAY: {
      return {
        ...state,
        isPlaying: false,
        currentTime: 0,
      }
    }

    case PlayerReducerTypes.TOGGLE_PICTURE_IN_PICTURE: {
      if (state.videoEl?.requestPictureInPicture) {
        if ((document as any).pictureInPictureElement) {
          ;(document as any).exitPictureInPicture()
        } else {
          state.videoEl?.requestPictureInPicture()
        }
      }
      return {
        ...state,
      }
    }

    case PlayerReducerTypes.TOGGLE_FULLSCREEN: {
      if (state.videoEl?.mozRequestFullScreen) {
        state.videoEl.mozRequestFullScreen()
      } else if (state.videoEl?.webkitRequestFullScreen) {
        state.videoEl.webkitRequestFullScreen()
      } else if (state.videoEl?.requestFullscreen) {
        state.videoEl.requestFullscreen()
      }
      return {
        ...state,
      }
    }

    case PlayerReducerTypes.TOGGLE_MUTED: {
      if (state.videoEl) {
        state.videoEl.muted = action.muted
      }
      return {
        ...state,
        muted: action.muted,
      }
    }

    case PlayerReducerTypes.UPDATE_DURATION: {
      return {
        ...state,
        duration: action.duration,
      }
    }

    case PlayerReducerTypes.UPDATE_PROGRESS: {
      let currentTime = state.videoEl?.currentTime || 0
      if (action.bySec !== undefined) {
        currentTime += action.bySec
      } else if (action.byPercent !== undefined) {
        currentTime += action.byPercent * state.duration
      } else if (action.atPercent !== undefined) {
        currentTime = action.atPercent * state.duration
      }
      currentTime = clamp(currentTime, 0, state.duration)

      if (state.videoEl) {
        state.videoEl.currentTime = currentTime
      }

      return {
        ...state,
      }
    }

    case PlayerReducerTypes.UPDATE_PLAYBACK_RATE: {
      if (state.videoEl) {
        state.videoEl.playbackRate = action.playbackRate
      }
      return {
        ...state,
        playbackRate: action.playbackRate,
      }
    }

    case PlayerReducerTypes.UPDATE_VOLUME: {
      let volume = state.videoEl?.volume || 1

      if (action.volume !== undefined) {
        volume = action.volume
      } else if (action.byPercent !== undefined) {
        volume += action.byPercent
      } else if (action.atPercent !== undefined) {
        volume = action.atPercent
      }
      volume = clamp(volume, 0, 1)

      if (state.videoEl) {
        state.videoEl.volume = volume
      }

      return {
        ...state,
        volume: volume,
        muted: volume === 0,
      }
    }

    case PlayerReducerTypes.REFRESH_CURRENT_TIME: {
      const currentTime = state.videoEl?.currentTime || 0
      const time = state.duration > 0 ? currentTime / state.duration : 0
      return {
        ...state,
        currentTime: time,
      }
    }

    case PlayerReducerTypes.REFRESH_BUFFERING: {
      if (!state.videoEl) return state

      let buffering = state.buffering
      for (let i = 0; i < state.videoEl.buffered.length; i++) {
        if (
          state.videoEl.buffered.start(state.videoEl.buffered.length - 1 - i) <
          state.videoEl.currentTime
        ) {
          buffering =
            state.videoEl.buffered.end(state.videoEl.buffered.length - 1 - i) / state.duration
          break
        }
      }

      return {
        ...state,
        buffering,
      }
    }

    default:
      return state
  }
}

export default playerContextReducer
