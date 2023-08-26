import React, { useCallback, useRef } from "react"

import { SpeakerWaveIcon } from "@heroicons/react/24/outline"
import { ReactComponent as PlayIcon } from "@/assets/icons/player/play.svg"

import usePlayerStore from "@/stores/player"
import { cn } from "@/utils/classnames"

import type { PlayerQuality } from "@/stores/player"

type VideoStarterProps = {
  posterUrl?: string
  embed?: boolean
}

const VideoStarter: React.FC<VideoStarterProps> = ({ posterUrl, embed }) => {
  const currentQuality = usePlayerStore(state => state.currentQuality)
  const qualities = usePlayerStore(state => state.qualities)
  const startPlaying = usePlayerStore(state => state.startPlaying)
  const setCurrentQuality = usePlayerStore(state => state.setCurrentQuality)

  const selectQuality = useCallback(
    (quality: PlayerQuality, e: React.MouseEvent) => {
      e.stopPropagation()
      setCurrentQuality(quality)
    },
    [setCurrentQuality]
  )

  return (
    <>
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={posterUrl}
        crossOrigin="anonymous"
      />

      <div
        className={cn(
          "group pointer-events-auto absolute inset-0 z-1 flex",
          "after:absolute after:inset-0 after:block after:bg-black/5",
          "after:transition-colors after:duration-200 after:ease-out hover:after:bg-black/0"
        )}
        tabIndex={0}
        role="button"
        onClick={startPlaying}
      >
        <div
          className={cn(
            "m-auto h-16 w-16 rounded-full bg-black/60 p-3 text-gray-200 shadow-lg sm:p-4",
            "transition-colors duration-200 ease-out",
            "group-hover:text-primary-500"
          )}
        >
          <PlayIcon className="ml-0.5 h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8" aria-hidden />
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-3 left-1/2 z-10 max-w-full -translate-x-1/2 overflow-x-auto md:bottom-6">
        <ul className="flex items-center space-x-2">
          {qualities.map(quality => (
            <li key={quality}>
              <button
                className={cn(
                  "flex items-center rounded bg-gray-500 px-2 text-sm text-white transition-colors hover:bg-primary-400 sm:px-2",
                  {
                    "bg-primary-500": quality === currentQuality,
                  }
                )}
                onClick={e => selectQuality(quality, e)}
              >
                {quality === "Audio" && <SpeakerWaveIcon className="mr-1" width={14} />}
                {quality}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default VideoStarter
