import "@vidstack/react/player/styles/default/captions.css"

import React from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { Captions, Controls, Gesture, useMediaState } from "@vidstack/react"

import * as Buttons from "../buttons"
import * as Menus from "../menus"
import * as Sliders from "../sliders"
import { TimeGroup } from "../time-group"
import { Title } from "../title"
import { cn } from "@/utils/classnames"

// Offset tooltips/menus/slider previews in the lower controls group so they're clearly visible.
const popupOffset = 30

export interface VideoLayoutProps {
  thumbnails?: string
}

export function VideoLayout({ thumbnails }: VideoLayoutProps) {
  const error = useMediaState("error")
  const started = useMediaState("started")
  const canPlay = useMediaState("canPlay")
  const canShowLayout = !error && canPlay

  if (!canShowLayout) {
    return null
  }

  return (
    <>
      <Gestures />
      <Captions
        className={`absolute inset-0 bottom-2 z-10 select-none break-words opacity-0 transition-[opacity,bottom] duration-300 media-captions:opacity-100 media-controls:bottom-[85px] media-preview:opacity-0`}
      />
      <Controls.Root
        className={cn(
          "absolute inset-0 z-10 flex h-full w-full flex-col opacity-0 transition-opacity media-controls:opacity-100 media-paused:opacity-100",
          {
            "!opacity-0 [&_*]:!pointer-events-none": !started,
          }
        )}
      >
        <Tooltip.Provider>
          <Controls.Group className="flex w-full items-center bg-gradient-to-b from-slate-950/60 to-transparent px-2 pb-4 pt-2 md:from-transparent">
            <div className="flex-1" />
            <Menus.PlaybackRate
              className="md:hidden"
              offset={popupOffset}
              tooltipOffset={popupOffset}
            />
            <Menus.Resolutions
              className="md:hidden"
              offset={popupOffset}
              tooltipOffset={popupOffset}
            />
            <Menus.Captions
              className="md:hidden"
              offset={popupOffset}
              tooltipOffset={popupOffset}
            />
          </Controls.Group>
          <div className="flex-1" />
          <div className="flex flex-col-reverse bg-gradient-to-t from-slate-950/60 to-transparent pt-8 md:flex-col">
            <Controls.Group className="md:hidden">
              <Title />
            </Controls.Group>
            <Controls.Group className="flex w-full items-center px-2">
              <Sliders.Time thumbnails={thumbnails} />
            </Controls.Group>
            <Controls.Group className="-mt-0.5 flex w-full items-center px-2 pb-2">
              <Buttons.Play tooltipAlign="start" tooltipOffset={popupOffset} />
              <Buttons.Mute tooltipOffset={popupOffset} />
              <Sliders.Volume />
              <TimeGroup />
              <Title className="hidden md:block" />
              <div className="flex-1" />
              <Menus.PlaybackRate
                className="hidden md:inline-flex"
                offset={popupOffset}
                tooltipOffset={popupOffset}
              />
              <Menus.Resolutions
                className="hidden md:inline-flex"
                offset={popupOffset}
                tooltipOffset={popupOffset}
              />
              <Menus.Captions
                className="hidden md:inline-flex"
                offset={popupOffset}
                tooltipOffset={popupOffset}
              />
              <Buttons.Pip tooltipOffset={popupOffset} />
              <Buttons.Fullscreen tooltipAlign="end" tooltipOffset={popupOffset} />
            </Controls.Group>
          </div>
        </Tooltip.Provider>
      </Controls.Root>
    </>
  )
}

function Gestures() {
  return (
    <>
      <Gesture
        className="absolute inset-0 z-0 block h-full w-full"
        event="pointerup"
        action="toggle:paused"
      />
      <Gesture
        className="absolute inset-0 z-0 block h-full w-full"
        event="dblpointerup"
        action="toggle:fullscreen"
      />
      <Gesture
        className="absolute left-0 top-0 z-10 block h-full w-1/5"
        event="dblpointerup"
        action="seek:-10"
      />
      <Gesture
        className="absolute right-0 top-0 z-10 block h-full w-1/5"
        event="dblpointerup"
        action="seek:10"
      />
    </>
  )
}
