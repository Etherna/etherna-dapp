import React from "react"

import classes from "@styles/components/player/PlayerWatchOn.module.scss"
import { ReactComponent as Logo } from "@assets/logo.svg"

import routes from "@routes"

type PlayerWatchOnProps = {
  hash: string
}

const PlayerWatchOn: React.FC<PlayerWatchOnProps> = ({ hash }) => {
  return (
    <a
      className={classes.playerWatchOn}
      href={import.meta.env.VITE_APP_PUBLIC_URL + routes.watch(hash)}
      target="_blank"
      rel="noreferrer"
    >
      <span>Watch on</span>
      <Logo aria-label="Etherna" />
    </a>
  )
}

export default PlayerWatchOn
