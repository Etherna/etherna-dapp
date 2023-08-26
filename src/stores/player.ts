import { isHLSProvider, isVideoProvider } from "vidstack"
import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import { isTouchDevice } from "@/utils/browser"

import type { VideoQuality, VideoSource } from "@etherna/sdk-js"
import type { Draft } from "immer"
import type { MediaPlayerElement } from "vidstack"

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

type SetFunc = (setFunc: (state: Draft<PlayerState>) => void) => void
type GetFunc = () => PlayerState

// move out from store to improve devtools performance
let player: MediaPlayerElement

const getHlsProvider = () => {
  if (!player) return null
  const provider = player.provider
  if (isHLSProvider(provider)) return provider.instance
  return null
}

const getVideoProvider = () => {
  if (!player) return null
  const provider = player.provider
  if (isVideoProvider(provider) && provider.type === "video") return provider
  return null
}

const setHlsQuality = (quality: PlayerQuality) => {
  const hls = getHlsProvider()
  if (!hls) return
  const levels = hls.levels
  const qualityLevelIndex = levels.findIndex(
    l => l.height === parseInt(quality) || (quality === "Audio" && l.height === 0)
  )
  hls.currentLevel = quality === "Auto" ? -1 : qualityLevelIndex
}

const actions = (set: SetFunc, get: GetFunc) => ({
  loadPlayer(playerInstance: MediaPlayerElement) {
    player = playerInstance

    player.addEventListener("hls-manifest-loaded", e => {
      setHlsQuality(get().currentQuality || PLAYER_INITIAL_QUALITY)
    })
    player.addEventListener("play", e => {
      set(state => {
        state.isPlaying = true
        state.isBuffering = false
      })
    })
    player.addEventListener("pause", e => {
      set(state => {
        state.isPlaying = false
      })
    })
    player.addEventListener("waiting", e => {
      set(state => {
        state.isBuffering = player.$store.waiting()
        state.buffered = player.$store.bufferedEnd()
      })
    })
    player.addEventListener("user-idle-change", () => {
      set(state => {
        state.isIdle = player.$store.userIdle()
      })
    })
    player.addEventListener("playing", e => {
      set(state => {
        state.isBuffering = false
        state.error = undefined
      })
    })
    player.addEventListener("duration-change", e => {
      set(state => {
        state.duration = player.$store.duration()
      })
    })
    player.addEventListener("volume-change", e => {
      set(state => {
        state.volume = player.volume
        state.muted = player.muted
      })
    })
    player.addEventListener("rate-change", e => {
      set(state => {
        state.playbackRate = player.playbackRate
      })
    })
    player.addEventListener("time-update", e => {
      set(state => {
        state.currentTime = player.$store.currentTime() || player.currentTime
      })
    })
    player.addEventListener("ended", e => {
      set(state => {
        state.isPlaying = false
      })
    })
    player.addEventListener("error", e => {
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

      setHlsQuality(quality)
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
  isWaitingToLoad() {
    if (!player) return true
    return player.$store.buffered().length === 0 && !player.$store.currentTime()
  },
  togglePlay() {
    set(state => {
      if (!player) return
      if (player.$store.playing()) {
        player.pause()
      } else {
        player.play()
      }

      state.isPlaying = player.$store.playing()
    })
  },
  startPlaying() {
    set(state => {
      if (!player) return

      const onLoadStart = () => {
        player.removeEventListener("loaded-data", onLoadStart)
        player.play()
        state.isPlaying = true
      }

      player.addEventListener("loaded-data", onLoadStart)

      const hlsProvider = getHlsProvider()
      const videoProvider = getVideoProvider()
      if (hlsProvider) {
        hlsProvider.startLoad()
      } else if (videoProvider) {
        // it's an mp4 source
        if (player.$store.canPlay()) {
          onLoadStart()
        } else {
          console.error("Cannot play video")
        }
      } else {
        alert("Unknown media provider")
      }
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
    if (player.$store.fullscreen()) {
      player.exitFullscreen()
    } else {
      player.enterFullscreen()
    }
  },
  togglePiP() {
    if (!player) return

    if (player.$store.pictureInPicture()) {
      player.exitPictureInPicture()
    } else {
      player.enterPictureInPicture()
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
