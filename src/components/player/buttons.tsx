import React from "react"
import { Slot } from "@radix-ui/react-slot"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
  CaptionButton,
  FullscreenButton,
  isTrackCaptionKind,
  MuteButton,
  PIPButton,
  PlayButton,
  SeekButton,
  useMediaState,
} from "@vidstack/react"
import {
  Minimize as FullscreenExitIcon,
  Maximize as FullscreenIcon,
  VolumeX as MuteIcon,
  PauseIcon,
  PictureInPictureIcon as PictureInPictureExitIcon,
  PictureInPicture2 as PictureInPictureIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  SubtitlesIcon,
  Volume2 as VolumeHighIcon,
  Volume1 as VolumeLowIcon,
} from "lucide-react"

import { cn } from "@/utils/classnames"

export interface MediaButtonProps {
  className?: string
  tooltipSide?: Tooltip.TooltipContentProps["side"]
  tooltipAlign?: Tooltip.TooltipContentProps["align"]
  tooltipOffset?: number
}

export function Play({
  className,
  tooltipOffset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
}: MediaButtonProps) {
  const isPaused = useMediaState("paused")
  return (
    <Tooltip.Root>
      <PlayerButton>
        <PlayButton className={className}>
          {isPaused ? (
            <PlayIcon className="size-7 translate-x-px fill-current" />
          ) : (
            <PauseIcon className="size-7 fill-current" />
          )}
        </PlayButton>
      </PlayerButton>
      <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isPaused ? "Play" : "Pause"}
      </ButtonTooltipContent>
    </Tooltip.Root>
  )
}

export function Mute({
  className,
  tooltipOffset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
}: MediaButtonProps) {
  const volume = useMediaState("volume")
  const isMuted = useMediaState("muted")

  return (
    <Tooltip.Root>
      <PlayerButton>
        <MuteButton className={cn("peer/volume pointer-coarse:hidden", className)}>
          {isMuted || volume == 0 ? (
            <MuteIcon className="size-5" strokeWidth={2} />
          ) : volume < 0.5 ? (
            <VolumeLowIcon className="size-5" strokeWidth={2} />
          ) : (
            <VolumeHighIcon className="size-5" strokeWidth={2} />
          )}
        </MuteButton>
      </PlayerButton>
      <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isMuted ? "Unmute" : "Mute"}
      </ButtonTooltipContent>
    </Tooltip.Root>
  )
}

export function Caption({
  className,
  tooltipOffset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
}: MediaButtonProps) {
  const track = useMediaState("textTrack")
  const isOn = track && isTrackCaptionKind(track)

  return (
    <Tooltip.Root>
      <PlayerButton>
        <CaptionButton
          className={cn(
            {
              "text-sky-500": isOn,
            },
            className
          )}
        >
          <SubtitlesIcon className="size-7" strokeWidth={1} />
        </CaptionButton>
      </PlayerButton>
      <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isOn ? "Closed-Captions Off" : "Closed-Captions On"}
      </ButtonTooltipContent>
    </Tooltip.Root>
  )
}

export function Seek({
  className,
  seconds,
  tooltipOffset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
}: MediaButtonProps & { seconds: number }) {
  const isBackward = seconds < 0

  return (
    <Tooltip.Root>
      <PlayerButton className={className}>
        <SeekButton className="relative pointer-coarse:hidden" seconds={seconds}>
          {isBackward ? (
            <RotateCcwIcon className="size-7" strokeWidth={1.5} />
          ) : (
            <RotateCwIcon className="size-7" strokeWidth={1.5} />
          )}
          <span className="mt-px text-[10px] font-semibold absolute-center">
            {Math.abs(seconds)}
          </span>
        </SeekButton>
      </PlayerButton>
      <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isBackward ? "Seek Backward" : "Seek Forward"}
      </ButtonTooltipContent>
    </Tooltip.Root>
  )
}

export function Pip({
  className,
  tooltipOffset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
}: MediaButtonProps) {
  const isActive = useMediaState("pictureInPicture")

  return (
    <Tooltip.Root>
      <PlayerButton className={className}>
        <PIPButton className="pointer-coarse:hidden">
          {isActive ? (
            <PictureInPictureExitIcon className="size-5" strokeWidth={2} />
          ) : (
            <PictureInPictureIcon className="size-5" strokeWidth={2} />
          )}
        </PIPButton>
      </PlayerButton>
      <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isActive ? "Exit PiP" : "Enter PiP"}
      </ButtonTooltipContent>
    </Tooltip.Root>
  )
}

export function Fullscreen({
  className,
  tooltipOffset = 0,
  tooltipSide = "top",
  tooltipAlign = "center",
}: MediaButtonProps) {
  const isActive = useMediaState("fullscreen")
  return (
    <Tooltip.Root>
      <PlayerButton>
        <FullscreenButton className={className}>
          {isActive ? (
            <FullscreenExitIcon className="size-5" strokeWidth={2} />
          ) : (
            <FullscreenIcon className="size-5" strokeWidth={2} />
          )}
        </FullscreenButton>
      </PlayerButton>
      <ButtonTooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipOffset}>
        {isActive ? "Exit Fullscreen" : "Enter Fullscreen"}
      </ButtonTooltipContent>
    </Tooltip.Root>
  )
}

export function PlayerButton({ children, className, ...props }: React.ComponentProps<"button">) {
  return (
    <Tooltip.Trigger asChild>
      <Slot
        className={cn(
          "group relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md outline-none ring-inset ring-sky-500 aria-disabled:hidden hover:bg-white/20 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent xs:h-10 xs:w-10",
          className
        )}
        {...props}
      >
        {children}
      </Slot>
    </Tooltip.Trigger>
  )
}

export function ButtonTooltipContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Tooltip.TooltipContent>) {
  return (
    <Tooltip.Content
      className={cn(
        "parent-data-[open]:hidden z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white animate-out fade-out slide-out-to-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in data-[state=delayed-open]:slide-in-from-bottom-4",
        className
      )}
      {...props}
    >
      {children}
    </Tooltip.Content>
  )
}
