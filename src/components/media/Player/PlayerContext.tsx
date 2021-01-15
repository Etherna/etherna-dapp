import React, { createContext, Dispatch, useContext, useReducer } from "react"
import { clamp } from "@utils/math"

const PlayerContext = createContext<PlayerContextStore|undefined>(undefined)

// Types
type PlayerContextStore = [state: PlayerContextState, dispatch: Dispatch<AnyAction>]

type PlayerContextState = {
  videoEl?: HTMLVideoElement & {
    requestPictureInPicture?: () => void
    mozRequestFullScreen?: () => void
    webkitRequestFullScreen?: () => void
  }
  source?: string
  sourceSize?: number
  currentQuality?: string
  isPlaying: boolean
  duration: number
  currentTime: number
  buffering: number
  volume: number
  muted: boolean
  playbackRate: number
  error?: {
    code: number
    message: string
  }
}

// Actions
export const ReducerTypes = {
  SET_VIDEO_ELEMENT: "SET_VIDEO_ELEMENT",
  SET_SOURCE: "SET_SOURCE",
  SET_CURRENT_QUALITY: "SET_CURRENT_QUALITY",
  SET_PLAYBACK_ERROR: "SET_PLAYBACK_ERROR",
  TOGGLE_PLAY: "TOGGLE_PLAY",
  RESET_PLAY: "RESET_PLAY",
  TOGGLE_FULLSCREEN: "TOGGLE_FULLSCREEN",
  TOGGLE_PICTURE_IN_PICTURE: "TOGGLE_PICTURE_IN_PICTURE",
  TOGGLE_MUTED: "TOGGLE_MUTED",
  UPDATE_DURATION: "UPDATE_DURATION",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  UPDATE_PLAYBACK_RATE: "UPDATE_PLAYBACK_RATE",
  UPDATE_VOLUME: "UPDATE_VOLUME",
  REFRESH_CURRENT_TIME: "REFRESH_CURRENT_TIME",
  REFRESH_BUFFERING: "REFRESH_BUFFERING",
} as const

type SetVideoElAction = {
  type: typeof ReducerTypes.SET_VIDEO_ELEMENT
  videoEl: HTMLVideoElement
}
type SetSourceAction = {
  type: typeof ReducerTypes.SET_SOURCE
  source: string
  size?: number
}
type SetCurrentQualityAction = {
  type: typeof ReducerTypes.SET_CURRENT_QUALITY
  currentQuality: string
}
type SetPlaybackErrorAction = {
  type: typeof ReducerTypes.SET_PLAYBACK_ERROR
  errorCode?: number
  errorMessage?: string
}
type TogglePlayAction = {
  type: typeof ReducerTypes.TOGGLE_PLAY
  isPlaying: boolean
}
type ResetPlayAction = {
  type: typeof ReducerTypes.RESET_PLAY
}
type ToggleFullScreenAction = {
  type: typeof ReducerTypes.TOGGLE_FULLSCREEN
}
type TogglePiPAction = {
  type: typeof ReducerTypes.TOGGLE_PICTURE_IN_PICTURE
}
type ToggleMutedAction = {
  type: typeof ReducerTypes.TOGGLE_MUTED
  muted: boolean
}
type UpdateDurationAction = {
  type: typeof ReducerTypes.UPDATE_DURATION
  duration: number
}
type UpdateProgressAction = {
  type: typeof ReducerTypes.UPDATE_PROGRESS
  bySec?: number
  byPercent?: number
  atPercent?: number
}
type UpdatePlaybackRateAction = {
  type: typeof ReducerTypes.UPDATE_PLAYBACK_RATE
  playbackRate: number
}
type UpdateVolumeAction = {
  type: typeof ReducerTypes.UPDATE_VOLUME
  volume?: number
  byPercent?: number
  atPercent?: number
}
type RefreshCurrentTimeAction = {
  type: typeof ReducerTypes.REFRESH_CURRENT_TIME
}
type RefreshBufferingAction = {
  type: typeof ReducerTypes.REFRESH_BUFFERING
}

type AnyAction = (
  SetVideoElAction |
  SetSourceAction |
  SetCurrentQualityAction |
  SetPlaybackErrorAction |
  TogglePlayAction |
  ResetPlayAction |
  ToggleFullScreenAction |
  TogglePiPAction |
  ToggleMutedAction |
  UpdateDurationAction |
  UpdateProgressAction |
  UpdatePlaybackRateAction |
  UpdateVolumeAction |
  RefreshCurrentTimeAction |
  RefreshBufferingAction
)

// Reducer
const reducer = (state: PlayerContextState, action: AnyAction): PlayerContextState => {
  switch (action.type) {
    case ReducerTypes.SET_VIDEO_ELEMENT: {
      return {
        ...state,
        videoEl: action.videoEl,
      }
    }

    case ReducerTypes.SET_SOURCE: {
      return {
        ...state,
        source: action.source,
        sourceSize: action.size
      }
    }
    case ReducerTypes.SET_CURRENT_QUALITY: {
      return {
        ...state,
        currentQuality: action.currentQuality,
      }
    }

    case ReducerTypes.SET_PLAYBACK_ERROR: {
      const { errorCode, errorMessage } = action
      return {
        ...state,
        error: errorCode && errorMessage ? {
          code: errorCode,
          message: errorMessage
        } : undefined,
      }
    }

    case ReducerTypes.TOGGLE_PLAY: {
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

    case ReducerTypes.RESET_PLAY: {
      return {
        ...state,
        isPlaying: false,
        currentTime: 0,
      }
    }

    case ReducerTypes.TOGGLE_PICTURE_IN_PICTURE: {
      if (state.videoEl?.requestPictureInPicture) {
        if ((document as any).pictureInPictureElement) {
          (document as any).exitPictureInPicture()
        } else {
          state.videoEl?.requestPictureInPicture()
        }
      }
      return {
        ...state,
      }
    }

    case ReducerTypes.TOGGLE_FULLSCREEN: {
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

    case ReducerTypes.TOGGLE_MUTED: {
      if (state.videoEl) {
        state.videoEl.muted = action.muted
      }
      return {
        ...state,
        muted: action.muted,
      }
    }

    case ReducerTypes.UPDATE_DURATION: {
      return {
        ...state,
        duration: action.duration,
      }
    }

    case ReducerTypes.UPDATE_PROGRESS: {
      let currentTime = state.videoEl?.currentTime || 0
      if (action.bySec) {
        currentTime += action.bySec
      } else if (action.byPercent) {
        currentTime += action.byPercent * state.duration
      } else if (action.atPercent) {
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

    case ReducerTypes.UPDATE_PLAYBACK_RATE: {
      if (state.videoEl) {
        state.videoEl.playbackRate = action.playbackRate
      }
      return {
        ...state,
        playbackRate: action.playbackRate,
      }
    }

    case ReducerTypes.UPDATE_VOLUME: {
      let volume = state.videoEl?.volume || 1

      if (action.volume) {
        volume = action.volume
      } else if (action.byPercent) {
        volume += action.byPercent
      } else if (action.atPercent) {
        volume = action.atPercent
      }
      volume = clamp(volume, 0, 1)

      if (state.videoEl) {
        state.videoEl.volume = volume
      }

      return {
        ...state,
        volume: volume,
      }
    }

    case ReducerTypes.REFRESH_CURRENT_TIME: {
      const currentTime = state.videoEl?.currentTime || 0
      const time = state.duration > 0 ? currentTime / state.duration : 0
      return {
        ...state,
        currentTime: time,
      }
    }

    case ReducerTypes.REFRESH_BUFFERING: {
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

// Wrapper
type PlayerContextProviderProps = {
  children: React.ReactNode
}
export const PlayerContextProvider = ({ children }: PlayerContextProviderProps) => {
  let store = useReducer(reducer, {
    videoEl: undefined,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    buffering: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
  })
  return <PlayerContext.Provider value={store}>{children}</PlayerContext.Provider>
}

// Hooks
export const useStateValue = () => useContext(PlayerContext)!
