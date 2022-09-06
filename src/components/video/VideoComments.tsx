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
import React, { useCallback, useEffect, useState } from "react"

import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"

import VideoCommentsItem from "./VideoCommentsItem"
import CommentForm from "@/components/video/CommentForm"
import type { IndexVideoComment } from "@/definitions/api-index"
import useSelector from "@/state/useSelector"

type VideoCommentsProps = {
  indexReference: string
  videoAuthorAddress?: string | null
}

const VideoComments: React.FC<VideoCommentsProps> = ({ indexReference, videoAuthorAddress }) => {
  const [comments, setComments] = useState<IndexVideoComment[]>([])
  const [isFetchingComments, setIsFetchingComments] = useState(false)

  const { indexClient } = useSelector(state => state.env)

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexReference])

  const fetchComments = useCallback(async () => {
    setIsFetchingComments(true)

    try {
      const comments = await indexClient.videos.fetchComments(indexReference, 0, 100)
      setComments(comments)
    } catch {}

    setIsFetchingComments(false)
  }, [indexClient.videos, indexReference])

  const onCommentPosted = useCallback((comment: IndexVideoComment) => {
    setComments(comments => [comment, ...comments])
  }, [])

  return (
    <div className="mt-12 md:mt-20">
      {!isFetchingComments && (
        <div className="my-4 text-md font-semibold">
          {comments.length} {comments.length > 1 ? "Comments" : "Comment"}
        </div>
      )}
      {comments.length === 0 && !isFetchingComments && (
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          No comments published yet. Be the first!
        </p>
      )}

      {!isFetchingComments && (
        <CommentForm indexReference={indexReference} onCommentPosted={onCommentPosted} />
      )}

      <div className="mt-8">
        {isFetchingComments && <Spinner className="mx-auto" width={28} height={28} />}

        {comments.map((comment, i) => (
          <VideoCommentsItem comment={comment} videoAuthorAddress={videoAuthorAddress} key={i} />
        ))}
      </div>
    </div>
  )
}

export default VideoComments
