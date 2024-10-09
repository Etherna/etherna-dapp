import React, { useEffect, useState } from "react"
import * as Slider from "@radix-ui/react-slider"
import {
  formatTime,
  Thumbnail,
  useMediaRemote,
  useMediaState,
  useSliderPreview,
} from "@vidstack/react"

export function Volume() {
  const volume = useMediaState("volume")
  const canSetVolume = useMediaState("canSetVolume")
  const remote = useMediaRemote()

  if (!canSetVolume) return null

  return (
    <Slider.Root
      className="group/volume relative inline-flex h-10 w-0 cursor-pointer touch-none select-none items-center overflow-hidden outline-none transition-all peer-hover/volume:w-20 peer-focus/volume:w-20 hover:w-20 focus:w-20"
      value={[volume * 100]}
      onValueChange={([value]) => {
        remote.changeVolume(value / 100)
      }}
    >
      <Slider.Track className="relative mx-1.5 h-[5px] w-full rounded-sm bg-white/30">
        <Slider.Range className="absolute h-full rounded-sm bg-primary-500 will-change-[width]" />
      </Slider.Track>
      <Slider.Thumb
        aria-label="Volume"
        className="block h-[15px] w-[15px] rounded-full border border-[#cacaca] bg-white opacity-0 outline-none ring-white/40 transition-opacity will-change-[left] group-hover/volume:opacity-100 group-focus/volume:opacity-100 focus:opacity-100 focus:ring-4"
      />
    </Slider.Root>
  )
}

export interface TimeSliderProps {
  thumbnails?: string
}

export function Time({ thumbnails }: TimeSliderProps) {
  const time = useMediaState("currentTime")
  const canSeek = useMediaState("canSeek")
  const duration = useMediaState("duration")
  const seeking = useMediaState("seeking")
  const remote = useMediaRemote()
  const step = (1 / duration) * 100
  const [value, setValue] = useState(0)
  const { previewRootRef, previewRef, previewValue } = useSliderPreview({
    clamp: true,
    offset: 6,
    orientation: "horizontal",
  })
  const previewTime = (previewValue / 100) * duration

  // Keep slider value in-sync with playback.
  useEffect(() => {
    if (seeking) return
    setValue((time / duration) * 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, duration])

  return (
    <Slider.Root
      className="group/time relative inline-flex h-9 w-full cursor-pointer touch-none select-none items-center outline-none"
      value={[value]}
      disabled={!canSeek}
      step={Number.isFinite(step) ? step : 1}
      ref={previewRootRef}
      onValueChange={([value]) => {
        setValue(value)
        remote.seeking((value / 100) * duration)
      }}
      onValueCommit={([value]) => {
        remote.seek((value / 100) * duration)
      }}
    >
      <Slider.Track className="relative h-[5px] grow rounded-sm bg-white/30">
        <Slider.Range className="absolute h-full rounded-sm bg-primary-500 will-change-[width]" />
      </Slider.Track>

      <Slider.Thumb
        aria-label="Current Time"
        className="block h-[15px] w-[15px] rounded-full border border-[#cacaca] bg-white opacity-0 outline-none ring-white/40 transition-opacity will-change-[left] group-hover/time:opacity-100 group-focus/time:opacity-100 focus:opacity-100 focus:ring-4"
      />

      {/* Preview */}
      <div
        className="pointer-events-none absolute flex flex-col items-center opacity-0 transition-opacity duration-200 will-change-[left] data-[visible]:opacity-100"
        ref={previewRef}
      >
        {thumbnails ? (
          <Thumbnail.Root
            src={thumbnails}
            time={previewTime}
            className="mb-2 block h-[var(--thumbnail-height)] max-h-[160px] min-h-[80px] w-[var(--thumbnail-width)] min-w-[120px] max-w-[180px] overflow-hidden border border-white bg-black"
          >
            <Thumbnail.Img />
          </Thumbnail.Root>
        ) : null}

        <span className="rounded bg-slate-950 px-1.5 py-px text-[13px] text-white">
          {formatTime(previewTime)}
        </span>
      </div>
    </Slider.Root>
  )
}
