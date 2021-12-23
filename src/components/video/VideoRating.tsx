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

import React, { useState, useEffect } from "react"
import classNames from "classnames"

import classes from "@styles/components/video/VideoRating.module.scss"
import { ReactComponent as ThumbUpIcon } from "@assets/icons/player/thumb-up.svg"

import useSelector from "@state/useSelector"
import type { VoteValue } from "@definitions/api-index"

type VideoRatingProps = {
  videoHash: string
  upvotes?: number
  downvotes?: number
}

const VideoRating: React.FC<VideoRatingProps> = ({
  videoHash,
  upvotes,
  downvotes,
}) => {
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes ?? 0)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes ?? 0)
  const [isUpdatingVote, setIsUpdatingVote] = useState(false)
  const [currentVote, setCurrentVote] = useState<VoteValue>("Neutral")

  const { indexClient } = useSelector((state) => state.env)

  const progress =
    currentUpvotes < currentDownvotes
      ? Math.round((currentUpvotes - currentDownvotes) / (currentUpvotes + currentDownvotes))
      : currentUpvotes > currentDownvotes
        ? Math.round((currentDownvotes - currentUpvotes) / (currentUpvotes + currentDownvotes))
        : 0.5

  useEffect(() => {
    setCurrentUpvotes(upvotes ?? 0)
    setCurrentDownvotes(downvotes ?? 0)
  }, [upvotes, downvotes])

  const giveThumbsUp = () => {
    const newVote: VoteValue = currentVote === "Up" ? "Neutral" : "Up"
    sendVote(newVote)
  }

  const giveThumbsDown = () => {
    const newVote: VoteValue = currentVote === "Down" ? "Neutral" : "Down"
    sendVote(newVote)
  }

  const sendVote = async (vote: VoteValue) => {
    const oldVote = currentVote

    setIsUpdatingVote(true)
    setCurrentVote(vote)

    try {
      await indexClient.videos.vote(videoHash, vote)

      udpateCounters(vote, oldVote)
    } catch {
      setCurrentVote(oldVote)
    }

    setIsUpdatingVote(false)
  }

  const udpateCounters = (newVote: VoteValue, oldVote: VoteValue) => {
    switch (oldVote) {
      case "Up":
        setCurrentUpvotes(votes => votes - 1)
        break
      case "Down":
        setCurrentDownvotes(votes => votes - 1)
        break
    }

    switch (newVote) {
      case "Up":
        setCurrentUpvotes(votes => votes + 1)
        break
      case "Down":
        setCurrentDownvotes(votes => votes + 1)
        break
    }
  }

  const shortNumber = (n: number | undefined) => {
    return n
      ? new Intl.NumberFormat(navigator.language, {
        notation: "compact",
        compactDisplay: "short",
      }).format(n)
      : 0
  }

  return (
    <div className={classes.videoRating}>
      <div className={classes.videoRatingButtons}>
        <button
          className={classNames(classes.videoRatingBtn)}
          onClick={giveThumbsUp}
          disabled={isUpdatingVote}
        >
          <span className={classes.thumbIcon}>
            <ThumbUpIcon />
          </span>
          <span className={classes.counter}>{shortNumber(currentUpvotes)}</span>
        </button>
        <button
          className={classNames(classes.videoRatingBtn, classes.ratingDown)}
          onClick={giveThumbsDown}
          disabled={isUpdatingVote}
        >
          <span className={classes.thumbIcon}>
            <ThumbUpIcon />
          </span>
          <span className={classes.counter}>{shortNumber(currentDownvotes)}</span>
        </button>
      </div>

      <div className={classes.videoRatingProgressbar}>
        <div className={classes.progress} style={{ width: `${progress * 100}%` }}></div>
      </div>
    </div>
  )
}

export default VideoRating
