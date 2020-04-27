import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"
import Slider from "@common/Slider"

const VolumeControl = () => {
    const [state, dispatch] = useStateValue()
    const { muted, volume } = state

    const toggleMute = () => {
        dispatch({
            type: ReducerTypes.TOGGLE_MUTED,
            muted: !muted,
        })
    }

    const updateVolume = value => {
        dispatch({
            type: ReducerTypes.UPDATE_VOLUME,
            volume: value,
        })
    }

    return (
        <div className="option-group">
            <div
                className="btn btn-option"
                onClick={toggleMute}
                onKeyDown={toggleMute}
                role="button"
                tabIndex={0}
            >
                {muted === true ? (
                    <img src={require("@svg/icons/muted-icon.svg")} alt="" />
                ) : volume < 0.25 ? (
                    <img
                        src={require("@svg/icons/volume-low-icon.svg")}
                        alt=""
                    />
                ) : (
                    <img src={require("@svg/icons/volume-icon.svg")} alt="" />
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
