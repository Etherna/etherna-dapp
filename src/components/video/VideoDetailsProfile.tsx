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
import { Link } from "react-router-dom"

import classes from "@styles/components/video/VideoDetailsProfile.module.scss"

import Avatar from "@components/user/Avatar"
import routes from "@routes"
import { shortenEthAddr } from "@utils/ethFuncs"
import { SwarmVideoOwner } from "@classes/SwarmVideo/types"

type VideoDetailsProfileProps = {
  owner?: SwarmVideoOwner
}

const VideoDetailsProfile: React.FC<VideoDetailsProfileProps> = ({ owner }) => {
  return (
    <div className={classes.videoDetailsProfile}>
      {owner?.ownerAddress && (
        <Link to={routes.getProfileLink(owner.ownerAddress)}>
          <div className={classes.videoProfile}>
            <Avatar image={owner.profileData?.avatar} address={owner.ownerAddress} />
            <h3 className={classes.profileName}>
              {owner.profileData?.name || shortenEthAddr(owner.ownerAddress)}
            </h3>
          </div>
        </Link>
      )}
    </div>
  )
}

export default VideoDetailsProfile
