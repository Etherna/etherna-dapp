import React, { useEffect } from "react"
import classnames from "classnames"

import Avatar from "@components/user/Avatar"
import { IndexVideoComment } from "@classes/EthernaIndexClient/types"
import useSwarmProfile from "@hooks/useSwarmProfile"
import dayjs from "@utils/dayjs"
import { Link } from "react-router-dom"
import routes from "@routes"

type VideoCommentsItemProps = {
  comment: IndexVideoComment
  videoAuthorAddress?: string
}

const VideoCommentsItem: React.FC<VideoCommentsItemProps> = ({ comment, videoAuthorAddress }) => {
  const { creationDateTime, text, ownerAddress, ownerIdentityManifest } = comment
  const { profile, loadProfile } = useSwarmProfile({
    hash: ownerIdentityManifest,
    address: ownerAddress,
    updateCache: true,
    fetchFromCache: true
  })

  useEffect(() => {
    if (ownerIdentityManifest) {
      loadProfile()
    }
  }, [comment])

  return (
    <div className="video-comment">
      <div className="video-comment-avatar">
        {profile.avatar && (
          <Avatar image={profile.avatar} address={ownerAddress} />
        )}
      </div>
      <div className="video-comment-content">
        <Link
          to={routes.getProfileLink(ownerAddress)}
          className={classnames("video-comment-author", { "is-video-author": videoAuthorAddress === ownerAddress })}
        >
          {profile.name}
        </Link>
        <span className="video-comment-time">
          {dayjs.duration(dayjs(creationDateTime).diff(dayjs())).humanize(true)}
        </span>
        <div className="video-comment-text">{text}</div>
      </div>
    </div>
  )
}

export default VideoCommentsItem
