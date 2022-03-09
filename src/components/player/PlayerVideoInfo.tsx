import React from "react"

import classes from "@styles/components/player/PlayerVideoInfo.module.scss"

import Avatar from "@components/user/Avatar"
import routes from "@routes"
import { shortenEthAddr } from "@utils/ethereum"
import type { Profile } from "@definitions/swarm-profile"

type PlayerVideoInfoProps = {
  hash: string
  title: string
  owner: Profile | undefined
}

const PlayerVideoInfo: React.FC<PlayerVideoInfoProps> = ({ hash, title, owner }) => {
  return (
    <a
      className={classes.playerVideoInfo}
      href={import.meta.env.VITE_APP_PUBLIC_URL + routes.watch(hash)}
      target="_blank"
      rel="noreferrer"
    >
      {owner && (
        <div className={classes.playerVideoInfoAvatar}>
          <Avatar image={owner.avatar} address={owner.address} />
        </div>
      )}
      <div className={classes.playerVideoInfoTitle}>
        <span>{title}</span>
        {owner && (
          <>
            <span>|</span>
            <span>{owner.name || shortenEthAddr(owner.address)}</span>
          </>
        )}
      </div>
    </a>
  )
}

export default PlayerVideoInfo
