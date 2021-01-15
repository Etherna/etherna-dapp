import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"
import Slider from "@common/Slider"
import { ReactComponent as MutedIcon } from "@svg/icons/muted-icon.svg"
import { ReactComponent as VolumeLowIcon } from "@svg/icons/volume-low-icon.svg"
import { ReactComponent as VolumeIcon } from "@svg/icons/volume-icon.svg"

const VolumeControl = () => {
  const [state, dispatch] = useStateValue()
  const { muted, volume } = state

  const toggleMute = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_MUTED,
      muted: !muted,
    })
  }

  const updateVolume = (value: number | number[] | null | undefined) => {
    dispatch({
      type: ReducerTypes.UPDATE_VOLUME,
      volume: value as number,
    })
  }

  return (
    <div className="option-group">
      <div
        className="btn btn-option"
        onClick={toggleMute}
        role="button"
        tabIndex={0}
      >
        {muted === true ? (
          <MutedIcon />
        ) : volume < 0.25 ? (
          <VolumeLowIcon />
        ) : (
          <VolumeIcon />
        )}
      </div>
      <div className="option-menu">
        <Slider
          value={volume}
          min={0}
          max={1}
          step={0.01}
          invert={true}
          orientation="vertical"
          className="vertical-slider"
          onChange={updateVolume}
        />
      </div>
    </div>
  )
}

export default VolumeControl
