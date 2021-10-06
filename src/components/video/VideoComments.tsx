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

import React, { useEffect, useState } from "react"

import classes from "@styles/components/video/VideoComments.module.scss"
import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"

import VideoCommentsItem from "./VideoCommentsItem"
import { IndexVideoComment } from "@classes/EthernaIndexClient/types"
import CommentForm from "@components/video/CommentForm"
import useSelector from "@state/useSelector"

type VideoCommentsProps = {
  videoHash: string
  videoAuthorAddress?: string
}

const VideoComments: React.FC<VideoCommentsProps> = ({ videoHash, videoAuthorAddress }) => {
  const [comments, setComments] = useState<IndexVideoComment[]>([])
  const [isFetchingComments, setIsFetchingComments] = useState(false)

  const { indexClient } = useSelector(state => state.env)

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoHash])

  const fetchComments = async () => {
    setIsFetchingComments(true)

    try {
      const comments = await indexClient.videos.fetchComments(videoHash, 0, 100)
      setComments(comments)
    } catch { }

    setIsFetchingComments(false)
  }

  const onCommentPosted = (comment: IndexVideoComment) => {
    setComments(comments => [comment, ...comments])
  }

  return (
    <div className={classes.videoCommentsContainer}>
      {!isFetchingComments && (
        <div className={classes.videoCommentsStats}>
          {comments.length} {comments.length > 1 ? "Comments" : "Comment"}
        </div>
      )}
      {comments.length === 0 && !isFetchingComments && (
        <p className={classes.videoCommentsEmpty}>No comments published yet. Be the first!</p>
      )}

      {!isFetchingComments && (
        <CommentForm videoHash={videoHash} onCommentPosted={onCommentPosted} />
      )}

      <div className={classes.videoComments}>
        {isFetchingComments && (
          <Spinner className="mx-auto" width={28} height={28} />
        )}

        {comments.map((comment, i) => (
          <VideoCommentsItem comment={comment} videoAuthorAddress={videoAuthorAddress} key={i} />
        ))}
      </div>
    </div>
  )
}

export default VideoComments
