import React from "react"

import { ReactComponent as MutedIcon } from "@svg/icons/player/muted-icon.svg"
import { ReactComponent as VolumeLowIcon } from "@svg/icons/player/volume-low-icon.svg"
import { ReactComponent as VolumeIcon } from "@svg/icons/player/volume-icon.svg"

import Slider from "@common/Slider"
import PlayerToolbarButton from "@components/media/PlayerToolbarButton"
import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"

const PlayerVolume: React.FC = () => {
  const [state, dispatch] = usePlayerState()
  const { muted, volume } = state

  const toggleMute = () => {
    dispatch({
      type: PlayerReducerTypes.TOGGLE_MUTED,
      muted: !muted,
    })
  }

  const updateVolume = (value: number | number[] | null | undefined) => {
    dispatch({
      type: PlayerReducerTypes.UPDATE_VOLUME,
      volume: value as number,
    })
  }

  return (
    <PlayerToolbarButton
      icon={
        muted === true ? (
          <MutedIcon />
        ) : volume < 0.25 ? (
          <VolumeLowIcon />
        ) : (
          <VolumeIcon />
        )
      }
      onClick={toggleMute}
      hasMenu
    >
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
    </PlayerToolbarButton>
  )
}

export default PlayerVolume
