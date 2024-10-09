import React, { useMemo, useState } from "react"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { Time, useMediaState, Poster as VidstackPoster } from "@vidstack/react"
import { CircleDollarSign, PlayIcon } from "lucide-react"

import Logo from "../common/Logo"
import { ChangeQualityRadio } from "./menus"
import routes from "@/routes"
import { usePlayerStore } from "@/stores/player"
import { cn } from "@/utils/classnames"
import { withAccessToken } from "@/utils/jwt"
import { autoRoundNumber } from "@/utils/math"

import type { Image } from "@etherna/sdk-js"
import type { PosterProps as VidstackPosterProps } from "@vidstack/react"

interface PosterProps extends Omit<VidstackPosterProps, "src"> {
  thumbnail?: Image | null
}

export function Poster({ className, thumbnail, style, ...props }: PosterProps) {
  const [loaded, setLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const started = useMediaState("started")
  const viewType = usePlayerStore(state => state.viewType)

  const posterUrl = useMemo(() => {
    const posterUrl = thumbnail?.sources.sort((a, b) => b.width - a.width)?.[0]?.url
    if (posterUrl) {
      return withAccessToken(posterUrl)
    }
    return undefined
  }, [thumbnail])

  return isError ? (
    <div
      className={cn(
        "absolute inset-0 block h-full w-full bg-slate-100/80 bg-cover bg-no-repeat object-cover opacity-0 backdrop-blur-lg transition-opacity data-[visible]:opacity-100 dark:bg-slate-900/80",
        {
          "brightness-50": thumbnail?.blurredBase64,
        }
      )}
      style={{
        backgroundImage: thumbnail?.blurredBase64 ? `url(${thumbnail.blurredBase64})` : undefined,
      }}
      data-visible={!started || undefined}
      {...props}
    />
  ) : (
    <VidstackPoster
      className={cn(
        "absolute bg-slate-100/80 object-cover opacity-0 transition-opacity data-[visible]:opacity-100 dark:bg-slate-900/80",
        {
          "left-1/2 top-6 h-24 w-auto -translate-x-1/2 rounded-md": viewType === "audio",
          "inset-0 block h-full w-full": viewType === "video",
        },
        className
      )}
      src={isError ? "" : posterUrl}
      style={{
        backgroundImage:
          thumbnail?.blurredBase64 && !loaded ? `url(${thumbnail.blurredBase64})` : undefined,
        ...style,
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setIsError(true)}
      {...props}
    />
  )
}

export function Startup() {
  const started = useMediaState("started")
  const quality = useMediaState("quality")
  const autoQuality = useMediaState("autoQuality")
  const duration = useMediaState("duration")
  const sources = usePlayerStore(state => state.sources)
  const viewType = usePlayerStore(state => state.viewType)
  const bytePrice = usePlayerStore(state => state.bytePrice)

  if (started || viewType === "audio") {
    return null
  }

  const currentQuality = (() => {
    // if (viewType === "audio") return "0"
    if (autoQuality) return "-1"
    if (quality) return quality.height.toString()
    return ""
  })()

  const totalCost = autoRoundNumber(((quality?.bitrate ?? 0) / 8) * duration * bytePrice, 3, 6)

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col bg-black/10 transition-colors duration-300 group-hover:bg-transparent">
      <div className="size-12 rounded-full bg-black/60 p-2.5 text-gray-200 shadow-lg transition-colors duration-200 ease-out absolute-center group-hover:text-primary-500 sm:size-16 sm:p-4">
        <PlayIcon className="ml-px size-full fill-current" aria-hidden />
      </div>
      <div className="flex-1" />
      <div className="flex h-full w-full flex-col items-center gap-x-8 gap-y-2 overflow-hidden bg-gradient-to-t from-black/60 via-transparent to-black/60 p-2 sm:h-auto sm:flex-row sm:via-black/30 sm:to-transparent sm:p-4 sm:pt-8">
        <RadioGroup.Root
          aria-label="Qualities"
          className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
          value={currentQuality}
        >
          {sources.map(source => (
            <ChangeQualityRadio
              key={source.height.toString()}
              className="whitespace-nowrap rounded bg-white px-1 py-px text-2xs text-slate-900 data-[state=checked]:bg-primary-500 data-[state=checked]:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 sm:text-sm xs:px-2 xs:py-1 xs:text-xs"
              source={source}
            >
              <RadioGroup.Item value={source.height.toString()}>{source.label}</RadioGroup.Item>
            </ChangeQualityRadio>
          ))}
        </RadioGroup.Root>
        <div className="flex-1" />
        <div className="ml-auto flex shrink-0 space-x-px overflow-hidden rounded">
          {totalCost > 0 && (
            <span className="inline-flex items-center space-x-1 bg-black px-2 py-1 text-2xs sm:text-xs">
              <CircleDollarSign className="size-3.5" />
              <span>~{totalCost}</span>
            </span>
          )}
          <Time className="inline-block bg-black px-2 py-1 text-xs sm:text-sm" type="duration" />
        </div>
      </div>
    </div>
  )
}

export function WatchOnEtherna({ hash }: { hash: string }) {
  return (
    <div className="absolute bottom-2 left-0 z-1 -translate-x-full transition-transform duration-200 ease-out media-paused:translate-x-0 media-started:bottom-auto media-started:top-6 md:bottom-auto md:top-6">
      <a
        className="inline-flex items-center space-x-3 rounded-r-md bg-gray-800/60 p-3 text-sm font-medium tracking-tight text-white hover:text-white sm:p-4"
        href={routes.withOrigin.watch(hash)}
        target="_blank"
        rel="noreferrer"
      >
        <span>Watch on</span>
        <Logo className="h-5 grayscale" forceWhite />
      </a>
    </div>
  )
}
