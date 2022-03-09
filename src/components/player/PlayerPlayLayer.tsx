import React from "react"

import classes from "@styles/components/player/PlayerPlayLayer.module.scss"
import { ReactComponent as PlayIcon } from "@assets/icons/player/play.svg"

type PlayerPlayLayerProps = {
  thumbnailUrl?: string | null
  onPlay(): void
}

const PlayerPlayLayer: React.FC<PlayerPlayLayerProps> = ({ thumbnailUrl, onPlay }) => {
  return (
    <div className={classes.playerPlayLayer} tabIndex={0} role="button" onClick={onPlay}>
      {thumbnailUrl && (
        <div className={classes.playerPlayLayerPoster} style={{ backgroundImage: `url(${thumbnailUrl})` }} />
      )}
      <div className={classes.playerPlayLayerCommand}>
        <PlayIcon aria-hidden />
      </div>
    </div>
  )
}

export default PlayerPlayLayer
