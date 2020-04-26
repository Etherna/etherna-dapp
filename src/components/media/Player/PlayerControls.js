import React from "react"

import PlayButton from "./controls/PlayButton"
import ProgressControl from "./controls/ProgressControl"
import TimeStatus from "./controls/TimeStatus"
import PlaybackRateControl from "./controls/PlaybackRateControl"
import PiPButton from "./controls/PiPButton"
import FullScreenButton from "./controls/FullScreenButton"
import VolumeControl from "./controls/VolumeControl"

const PlayerControls = () => {
    return (
        <div className="controls">
            {/* Progress */}
            <ProgressControl />

            {/* Play / Pause */}
            <PlayButton />

            {/* Time */}
            <TimeStatus />

            <div className="options-group">
                {/* Playback rate */}
                <PlaybackRateControl />

                {/* Picture in Picture */}
                {"pictureInPictureEnabled" in document && (
                    <PiPButton />
                )}

                {/* Fullscreen */}
                <FullScreenButton />

                {/* Volume */}
                <VolumeControl />
            </div>
        </div>
    )
}

export default PlayerControls