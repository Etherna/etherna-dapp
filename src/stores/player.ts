import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import { isTouchDevice } from "@/utils/browser"

import type { VideoQuality, VideoSource } from "@etherna/api-js"
import type { WritableDraft } from "immer/dist/internal"

export type PlayerQuality = "Auto" | "Audio" | VideoQuality

export type PlayerState = {
  sources: VideoSource[]
  qualities: PlayerQuality[]
  currentSource?: VideoSource
  currentQuality?: PlayerQuality
  isPlaying: boolean
  buffered: number
  isBuffering: boolean
  isIdle: boolean
  isActive: boolean
  floating: boolean
  duration: number
  currentTime: number
  volume: number
  muted: boolean
  playbackRate: number
  error?: {
    code: number
    message: string
  }
}

export const QUALITY_STORAGE_KEY = "etherna:player-quality"
export const PLAYER_INITIAL_QUALITY = "360p"

const getCurrentSource = (sources: VideoSource[], quality: PlayerQuality) => {
  if (quality === "Audio") {
    return sources.find(s => s.type !== "mp4" && s.path.match(/audio\.(mpd|m3u8)$/))
  }
  const isAdaptive = sources.some(s => s.type !== "mp4")
  if (quality === "Auto" || isAdaptive) {
    return sources.find(s => s.type !== "mp4" && s.path.match(/manifest\.(mpd|m3u8)$/))
  }
  return sources.find(s => s.type === "mp4" && s.quality === quality)
}

const getInitialState = (): PlayerState => ({
  sources: [],
  qualities: [],
  currentQuality: (localStorage.getItem(QUALITY_STORAGE_KEY) as PlayerQuality) || undefined,
  isPlaying: false,
  buffered: 0,
  isBuffering: false,
  isActive: false,
  isIdle: true,
  floating: !isTouchDevice(),
  duration: 0,
  currentTime: 0,
  volume: 1,
  muted: false,
  playbackRate: 1,
})

type SetFunc = (setFunc: (state: WritableDraft<PlayerState>) => void) => void
type GetFunc = () => PlayerState

// move out from store to improve devtools performance
let player: HTMLVmPlayerElement

const actions = (set: SetFunc, get: GetFunc) => ({
  loadPlayer(playerInstance: HTMLVmPlayerElement) {
    player = playerInstance
    player.addEventListener("vmPausedChange", e => {
      const event = e as CustomEvent<boolean>
      set(state => {
        state.isPlaying = !event.detail
        if (player.playing) {
          state.isBuffering = false
        }
      })
    })
    player.addEventListener("vmBufferingChange", e => {
      set(state => {
        state.isBuffering = player.buffering
        state.buffered = player.buffered
      })
    })
    player.addEventListener("vmPlaybackStarted", e => {
      set(state => {
        state.isBuffering = false
        state.error = undefined
      })
    })
    player.addEventListener("vmVolumeChange", e => {
      set(state => {
        state.volume = player.volume
        state.muted = player.muted
      })
    })
    player.addEventListener("vmPlaybackRatesChange", e => {
      set(state => {
        state.playbackRate = player.playbackRate
      })
    })
    player.addEventListener("vmDurationChange", e => {
      const event = e as CustomEvent<number>
      set(state => {
        state.duration = event.detail
      })
    })
    player.addEventListener("vmCurrentTimeChange", e => {
      const event = e as CustomEvent<number>
      set(state => {
        state.currentTime = event.detail
      })
    })
    player.addEventListener("vmPlaybackEnded", e => {
      set(state => {
        state.isPlaying = false
      })
    })
    player.addEventListener("vmError", e => {
      set(state => {
        state.isBuffering = false
      })
    })
  },
  setSources(sources: VideoSource[]) {
    set(state => {
      const getAdaptiveSourceQuality = (source: VideoSource & { type: "hls" | "dash" }) => {
        if (source.path.match(/audio\.(mpd|m3u8)$/)) return "Audio"
        if (source.path.match(/[0-9]{3,}p\.(mpd|m3u8)$/))
          return source.path.match(/([0-9]{3,}p)\.(mpd|m3u8)$/)![1] as VideoQuality
        return "Auto"
      }
      const preferredQuality = state.currentQuality
      const qualities = sources
        .map<PlayerQuality>(s => (s.type === "mp4" ? s.quality : getAdaptiveSourceQuality(s)))
        .sort((a, b) => {
          if (a === "Audio") return -1
          if (b === "Audio") return 1
          if (a === "Auto") return 1
          if (b === "Auto") return -1
          return parseInt(a) - parseInt(b)
        })
      const isAdaptive = qualities.some(q => q === "Auto")
      const exactPreferredQuality = preferredQuality
        ? qualities.find(q => q === preferredQuality)
        : null
      const closestQuality = !exactPreferredQuality
        ? qualities.find(q => parseInt(q) >= parseInt(preferredQuality || PLAYER_INITIAL_QUALITY))
        : null
      const quality =
        exactPreferredQuality ||
        closestQuality ||
        preferredQuality ||
        (isAdaptive ? "Auto" : qualities[0])

      state.sources = sources
      state.qualities = qualities
      state.currentQuality = quality
      state.currentSource = getCurrentSource(sources, quality)
    })
  },
  setCurrentQuality(quality: PlayerQuality) {
    set(state => {
      state.currentQuality = quality
      state.currentSource = getCurrentSource(state.sources, quality)

      if (quality !== "Audio") {
        localStorage.setItem(QUALITY_STORAGE_KEY, quality)
      }

      player.playbackQuality = quality
    })
  },
  setCurrentTime(time: number) {
    set(state => {
      if (!player) return
      player.currentTime = time
      state.currentTime = time
    })
  },
  setVolume(volume: number) {
    set(state => {
      if (!player) return
      player.volume = volume
      state.volume = volume
    })
  },
  setPlaybackRate(rate: number) {
    set(state => {
      if (!player) return
      player.playbackRate = rate
      state.playbackRate = rate
    })
  },
  showError(code: number, message: string) {
    set(state => {
      state.error = {
        code,
        message,
      }
    })
  },
  togglePlay() {
    set(state => {
      if (!player) return
      if (state.isPlaying) {
        player.pause()
      } else {
        player.play()
      }

      state.isPlaying = player.playing
    })
  },
  toggleMute() {
    set(state => {
      if (!player) return
      player.muted = !player.muted
      state.muted = player.muted
    })
  },
  toggleFullScreen() {
    if (!player) return
    if (player.isFullscreenActive) {
      player.exitFullscreen()
    } else {
      player.enterFullscreen()
    }
  },
  togglePiP() {
    if (!player) return
    if (player.isPiPActive) {
      player.exitPiP()
    } else {
      player.enterPiP()
    }
  },
})

const usePlayerStore = create<PlayerState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      immer((set, get) => ({
        ...getInitialState(),
        ...actions(set, get),
      })),
      {
        name: "player",
      }
    )
  )
)

export default usePlayerStore
