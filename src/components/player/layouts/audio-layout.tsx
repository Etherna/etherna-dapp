import React from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { Captions, Controls, useMediaState } from "@vidstack/react"

import * as Buttons from "../buttons"
import * as Menus from "../menus"
import * as Sliders from "../sliders"
import { TimeGroup } from "../time-group"
import { Title } from "../title"

export interface AudioLayoutProps {
  thumbnails?: string
}

const popupOffset = 12

export function AudioLayout({ thumbnails }: AudioLayoutProps) {
  const error = useMediaState("error")
  const canPlay = useMediaState("canPlay")
  const canShowLayout = !error && canPlay

  if (!canShowLayout) {
    return null
  }

  return (
    <>
      <Captions
        className={`absolute inset-0 bottom-2 z-1 select-none break-words opacity-0 transition-[opacity,bottom] duration-300 media-captions:opacity-100 media-controls:bottom-[85px] media-preview:opacity-0`}
      />
      <Controls.Root className="absolute inset-0 z-1 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity media-controls:opacity-100">
        <Tooltip.Provider>
          <div className="flex-1" />
          <Controls.Group className="flex w-full items-center px-2">
            <Sliders.Time thumbnails={thumbnails} />
          </Controls.Group>
          <Controls.Group className="-mt-0.5 flex w-full items-center px-2 pb-2">
            <Buttons.Play tooltipAlign="start" tooltipOffset={popupOffset} />
            <Buttons.Mute tooltipOffset={popupOffset} />
            <Sliders.Volume />
            <TimeGroup />
            <div className="mx-3" />
            <Buttons.Seek seconds={-10} />
            <Buttons.Seek seconds={10} />
            <Title />
            <div className="flex-1" />
            <Menus.PlaybackRate
              className="hidden md:inline-flex"
              offset={popupOffset}
              tooltipOffset={popupOffset}
              side="bottom"
            />
            <Menus.Resolutions
              className="hidden md:inline-flex"
              offset={popupOffset}
              tooltipOffset={popupOffset}
              side="bottom"
            />
          </Controls.Group>
        </Tooltip.Provider>
      </Controls.Root>
    </>
  )
}
