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
import classNames from "classnames"

import "./video-rating.scss"
import { ReactComponent as ThumbUpIcon } from "@svg/icons/player/thumb-up.svg"

import { VoteValue } from "@classes/EthernaIndexClient/types"
import useSelector from "@state/useSelector"

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
    currentUpvotes > currentDownvotes
      ? Math.round(currentUpvotes - currentDownvotes / currentUpvotes + currentDownvotes)
      : currentUpvotes < currentDownvotes
        ? Math.round(currentDownvotes - currentUpvotes / currentUpvotes + currentDownvotes)
        : 0.5

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
    <div className="video-rating">
      <div className="video-rating-buttons">
        <button className="video-rating-btn rating-up" onClick={giveThumbsUp}>
          <span className="thumb-icon">
            <ThumbUpIcon />
          </span>
          <span className="counter">{shortNumber(currentUpvotes)}</span>
        </button>
        <button className="video-rating-btn rating-down" onClick={giveThumbsDown}>
          <span className="thumb-icon">
            <ThumbUpIcon />
          </span>
          <span className="counter">{shortNumber(currentDownvotes)}</span>
        </button>
      </div>

      <div className="video-rating-progressbar">
        <div className="progress" style={{ width: `${progress * 100}%` }}></div>
      </div>
    </div>
  )
}

export default VideoRating
