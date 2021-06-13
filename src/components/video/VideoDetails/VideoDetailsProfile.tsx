import React from "react"
import { Link } from "react-router-dom"

import Avatar from "@components/user/Avatar"
import routes from "@routes"
import { shortenEthAddr } from "@utils/ethFuncs"
import { SwarmVideoOwner } from "@classes/SwarmVideo/types"

type VideoDetailsProfileProps = {
  owner?: SwarmVideoOwner
}

const VideoDetailsProfile: React.FC<VideoDetailsProfileProps> = ({ owner }) => {
  return (
    <div className="video-details-profile">
      {owner?.ownerAddress && (
        <Link to={routes.getProfileLink(owner.ownerAddress)}>
          <div className="video-profile">
            <Avatar image={owner.profileData?.avatar} address={owner.ownerAddress} />
            <h3 className="profile-name">
              {owner.profileData?.name || shortenEthAddr(owner.ownerAddress)}
            </h3>
          </div>
        </Link>
      )}
    </div>
  )
}

export default VideoDetailsProfile
