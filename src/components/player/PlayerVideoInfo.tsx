/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

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
