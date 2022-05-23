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
import { Link } from "react-router-dom"
import classNames from "classnames"

import classes from "@styles/components/video/VideoCommentsItem.module.scss"

import MarkdownPreview from "@common/MarkdownPreview"
import VideoCommentPlaceholder from "@components/placeholders/VideoCommentPlaceholder"
import Avatar from "@components/user/Avatar"
import useSwarmProfile from "@hooks/useSwarmProfile"
import routes from "@routes"
import { shortenEthAddr } from "@utils/ethereum"
import dayjs from "@utils/dayjs"
import type { IndexVideoComment } from "@definitions/api-index"

type VideoCommentsItemProps = {
  comment: IndexVideoComment
  videoAuthorAddress?: string | null
}

const VideoCommentsItem: React.FC<VideoCommentsItemProps> = ({ comment, videoAuthorAddress }) => {
  const { creationDateTime, text, ownerAddress } = comment
  const { profile, isLoading, loadProfile } = useSwarmProfile({
    address: ownerAddress,
    updateCache: true,
    fetchFromCache: true,
  })

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment])

  if (isLoading) return (
    <VideoCommentPlaceholder />
  )

  return (
    <div className={classes.videoComment}>
      <div className={classes.videoCommentAvatar}>
        <Avatar image={profile?.avatar} address={ownerAddress} />
      </div>
      <div className={classes.videoCommentContent}>
        <Link
          to={routes.channel(ownerAddress)}
          className={classNames(classes.videoCommentAuthor, {
            [classes.isVideoAuthor]: videoAuthorAddress === ownerAddress
          })}
        >
          {profile?.name || shortenEthAddr(ownerAddress)}
        </Link>
        <span className={classes.videoCommentTime}>
          {dayjs.duration(dayjs(creationDateTime).diff(dayjs())).humanize(true)}
        </span>
        <MarkdownPreview className={classes.videoCommentText} value={text} />
      </div>
    </div>
  )
}

export default VideoCommentsItem
