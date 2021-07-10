import { Dispatch } from "react"
import { AnyPlayerAction } from "@context/player-context"

export type PlayerContextStore = [state: PlayerContextState, dispatch: Dispatch<AnyPlayerAction>]

export type PlayerContextState = {
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
