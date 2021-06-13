import React, { useEffect, useState } from "react"

import "./video-comments.scss"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"

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
    <div className="video-comments-container">
      {!isFetchingComments && (
        <div className="video-comments-stats">{comments.length} {comments.length > 1 ? "Comments" : "Comment"}</div>
      )}
      {comments.length === 0 && !isFetchingComments && (
        <p className="video-comments-empty">No comments published yet. Be the first!</p>
      )}

      {!isFetchingComments && (
        <CommentForm videoHash={videoHash} onCommentPosted={onCommentPosted} />
      )}

      <div className="video-comments">
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
