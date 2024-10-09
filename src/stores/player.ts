import { useStore } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { createStore } from "zustand/vanilla"

import logger from "./middlewares/log"
import { AUDIO_REGEX, MANIFEST_REGEX, VIDEO_REGEX } from "@/components/player/utils"

import type { VideoQuality, VideoSource } from "@etherna/sdk-js"
import type { Draft } from "immer"

export type PlayerQuality = "Auto" | "Audio" | VideoQuality

export type PlayerVideoSource = VideoSource & { height: number; label: string }

export type PlayerState = {
  sources: PlayerVideoSource[]
  bytePrice: number
  viewType: "video" | "audio"
}

const getInitialState = (): PlayerState => ({
  sources: [],
  bytePrice: 0,
  viewType: "video",
})

type SetFunc = (setFunc: (state: Draft<PlayerState>) => void) => void
type GetFunc = () => PlayerState

const actions = (set: SetFunc, get: GetFunc) => ({
  setSources(sources: VideoSource[]) {
    set(state => {
      state.sources = sources.map(source => {
        const height = (() => {
          if (source.type === "mp4") {
            return parseInt(source.quality)
          }
          if (MANIFEST_REGEX.test(source.path)) {
            return -1
          }
          if (AUDIO_REGEX.test(source.path)) {
            return 0
          }
          if (VIDEO_REGEX.test(source.path)) {
            const matches = VIDEO_REGEX.exec(source.path)
            return matches?.groups?.q ? parseInt(matches.groups.q) : 0
          }
          return 0
        })()

        const label = (() => {
          switch (height) {
            case -1:
              return "Auto"
            case 0:
              return "Audio only"
            default:
              return `${height}p`
          }
        })()

        return {
          ...source,
          height,
          label,
        }
      })
    })
  },
  setBytePrice(price: number) {
    set(state => {
      state.bytePrice = price
    })
  },
  setViewType(viewType: "video" | "audio") {
    set(state => {
      state.viewType = viewType
    })
  },
})

export const PlayerStore = createStore<PlayerState & ReturnType<typeof actions>>()(
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

export const usePlayerStore = <U>(
  selector: (state: PlayerState & ReturnType<typeof actions>) => U
) => useStore(PlayerStore, selector)
