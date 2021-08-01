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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
