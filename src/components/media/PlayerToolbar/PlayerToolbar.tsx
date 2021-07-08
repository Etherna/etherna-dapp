import React from "react"
import classNames from "classnames"

import "./player-toolbar.scss"

import PlayerToolbarProgress from "@components/media/PlayerToolbarProgress"
import PlayerPlayButton from "@components/media/PlayerPlayButton"
import PlayerTimeProgress from "@components/media/PlayerTimeProgress"
import PlayerPlaybackSpeed from "@components/media/PlayerPlaybackSpeed"
import PlayerFullScreenButton from "@components/media/PlayerFullScreenButton"
import PlayerPiPButton from "@components/media/PlayerPiPButton"
import PlayerVolume from "@components/media/PlayerVolume"

type PlayerToolbarProps = {
  floating?: boolean
}

const PlayerToolbar: React.FC<PlayerToolbarProps> = ({ floating }) => {
  return (
    <div className={classNames("player-toolbar", { floating })}>
      <PlayerToolbarProgress />

      <div className="player-toolbar-content">
        <div className="player-toolbar-playback-group">
          <PlayerPlayButton />
          <PlayerTimeProgress />
        </div>

        <div className="player-toolbar-video-setting-group">
          <PlayerPlaybackSpeed />
        </div>

        <div className="player-toolbar-video-setting-group">
          <PlayerVolume />
          {"pictureInPictureEnabled" in document && <PlayerPiPButton />}
          <PlayerFullScreenButton />
        </div>
      </div>
    </div>
  )
}

export default PlayerToolbar
