import React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Slot } from "@radix-ui/react-slot"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
  isHLSProvider,
  isVideoProvider,
  useCaptionOptions,
  useMediaPlayer,
  useMediaRemote,
  useMediaState,
  usePlaybackRateOptions,
} from "@vidstack/react"
import { CircleIcon, SubtitlesIcon } from "lucide-react"

import { ButtonTooltipContent, PlayerButton } from "./buttons"
import { usePlayerStore } from "@/stores/player"
import { cn } from "@/utils/classnames"

import type { PlayerVideoSource } from "@/stores/player"
import type * as RadioGroup from "@radix-ui/react-radio-group"

export interface MenuProps {
  className?: string
  side?: DropdownMenu.DropdownMenuContentProps["side"]
  align?: DropdownMenu.DropdownMenuContentProps["align"]
  offset?: DropdownMenu.DropdownMenuContentProps["sideOffset"]
  tooltipSide?: Tooltip.TooltipContentProps["side"]
  tooltipAlign?: Tooltip.TooltipContentProps["align"]
  tooltipOffset?: number
}

export function Resolutions({
  className,
  side = "top",
  align = "end",
  offset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
  tooltipOffset = 0,
}: MenuProps) {
  const quality = useMediaState("quality")
  const autoQuality = useMediaState("autoQuality")
  const sources = usePlayerStore(state => state.sources)
  const viewType = usePlayerStore(state => state.viewType)
  const remote = useMediaRemote()

  const value = (() => {
    if (viewType === "audio") return "0"
    if (autoQuality) return "-1"
    if (quality) return quality.height.toString()
    return ""
  })()
  const label = (() => {
    switch (value) {
      case "-1":
        return "Auto"
      case "0":
        return "Audio"
      default:
        return value + "p"
    }
  })()

  if (autoQuality && !sources.some(s => s.height === -1)) {
    remote.changeQuality(sources.length - 1)
  }

  return (
    <DropdownMenu.Root>
      <Tooltip.Root>
        <PlayerButton className={cn("w-auto px-2", className)}>
          <DropdownMenu.Trigger aria-label="Qualities">
            <span className="rounded border border-white px-1.5 py-px text-2xs text-white">
              {label}
            </span>
          </DropdownMenu.Trigger>
        </PlayerButton>
        <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
          Resolutions
        </ButtonTooltipContent>
      </Tooltip.Root>
      <DropdownMenuContent side={side} align={align} sideOffset={offset}>
        <DropdownMenu.Label className="mb-2 flex w-full items-center px-1.5 text-sm font-medium">
          Resolutions
        </DropdownMenu.Label>

        <DropdownMenu.RadioGroup
          aria-label="Qualities"
          className="flex w-full flex-col"
          value={value}
        >
          {sources.map(source => (
            <ChangeQualityRadio key={source.height.toString()} source={source}>
              <Radio value={source.height.toString()}>{source.label}</Radio>
            </ChangeQualityRadio>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenuContent>
    </DropdownMenu.Root>
  )
}

export function ChangeQualityRadio({
  source,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroup.RadioGroupItem>, "value"> & {
  source: PlayerVideoSource
}) {
  const player = useMediaPlayer()
  const remote = useMediaRemote()
  const qualities = useMediaState("qualities")
  const setViewType = usePlayerStore(state => state.setViewType)

  const setQuality = async () => {
    if (source.height === 0) {
      setViewType("audio")
      return
    }

    setViewType("video")

    if (source.height === -1) {
      remote.changeQuality(-1)
      return
    }

    const provider = player?.provider

    if (isHLSProvider(provider) && provider.instance) {
      // wait to load levels
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          if (provider.instance?.levels.length) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })

      remote.changeQuality(provider.instance.levels.findIndex(l => l.height === source.height))
    }

    if (isVideoProvider(provider)) {
      remote.changeQuality(qualities.findIndex(l => l.height === source.height))
    }
  }

  return <Slot onClick={setQuality} {...props} />
}

export function Captions({
  className,
  side = "top",
  align = "end",
  offset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
  tooltipOffset = 0,
}: MenuProps) {
  const options = useCaptionOptions()
  const hint = options.selectedTrack?.label ?? "Off"

  return (
    <DropdownMenu.Root>
      <Tooltip.Root>
        <PlayerButton className={cn("w-auto px-2", className)}>
          <DropdownMenu.Trigger aria-label="Captions" disabled={options.disabled}>
            <span className="whitespace-nowrap rounded border border-white px-1.5 py-px text-2xs text-white">
              CC{options.selectedTrack ? ` (${options.selectedTrack.language})` : ""}
            </span>
          </DropdownMenu.Trigger>
        </PlayerButton>
        <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
          Captions
        </ButtonTooltipContent>
      </Tooltip.Root>
      <DropdownMenuContent side={side} align={align} sideOffset={offset}>
        <DropdownMenu.Label className="mb-2 flex w-full items-center px-1.5 text-sm font-medium">
          Captions
          <span className="ml-auto text-sm text-white/50">{hint}</span>
        </DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          aria-label="Captions"
          className="flex w-full flex-col"
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenuContent>
    </DropdownMenu.Root>
  )
}

export function PlaybackRate({
  className,
  side = "top",
  align = "end",
  offset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
  tooltipOffset = 0,
}: MenuProps) {
  const options = usePlaybackRateOptions()
  const remote = useMediaRemote()

  return (
    <DropdownMenu.Root>
      <Tooltip.Root>
        <PlayerButton className={className}>
          <DropdownMenu.Trigger aria-label="Playback rate" disabled={options.disabled}>
            <span className="rounded border border-white px-1.5 py-px text-2xs text-white">
              {options.selectedValue}⨉
            </span>
          </DropdownMenu.Trigger>
        </PlayerButton>
        <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
          Playback rate
        </ButtonTooltipContent>
      </Tooltip.Root>
      <DropdownMenuContent side={side} align={align} sideOffset={offset}>
        <DropdownMenu.Label className="mb-2 flex w-full items-center px-1.5 text-sm font-medium">
          Playback rate
        </DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          aria-label="Playback rate"
          className="flex w-full flex-col"
          value={options.selectedValue}
        >
          {[0.25, 0.5, 1, 1.25, 1.5, 2, 2.5].map(rate => (
            <Radio
              value={rate.toString()}
              onSelect={() => remote.changePlaybackRate(rate)}
              key={rate}
            >
              {rate}⨉
            </Radio>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenuContent>
    </DropdownMenu.Root>
  )
}

function Radio({ children, ...props }: DropdownMenu.DropdownMenuRadioItemProps) {
  return (
    <DropdownMenu.RadioItem
      className="group relative flex w-full cursor-pointer select-none items-center justify-start rounded-sm p-2.5 text-sm outline-none ring-sky-500 data-[focus]:ring-[3px] focus:bg-white/10"
      {...props}
    >
      <div className="relative mr-2 flex">
        <CircleIcon className="size-4 text-white group-data-[state=checked]:text-primary-500" />
        <div className="hidden size-2 rounded-full bg-primary-500 absolute-center group-data-[state=checked]:block" />
      </div>
      <span>{children}</span>
    </DropdownMenu.RadioItem>
  )
}

function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.DropdownMenuContent>) {
  return (
    <DropdownMenu.Content
      className={cn(
        "z-[9999] flex max-h-[400px] min-w-[260px] flex-col rounded-md border border-white/10 bg-slate-950/95 p-2.5 font-sans text-sm font-medium outline-none backdrop-blur-sm duration-300 animate-out fade-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  )
}
