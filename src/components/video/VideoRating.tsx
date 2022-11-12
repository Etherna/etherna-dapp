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
import React, { useState, useEffect, useMemo, useCallback } from "react"

import { ReactComponent as VoteIcon } from "@/assets/icons/player/upvote.svg"

import useClientsStore from "@/stores/clients"
import classNames from "@/utils/classnames"

import type { VoteValue } from "@etherna/api-js/clients"

type VideoRatingProps = {
  videoId: string
  upvotes?: number
  downvotes?: number
}

const VideoRating: React.FC<VideoRatingProps> = ({ videoId, upvotes, downvotes }) => {
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes ?? 0)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes ?? 0)
  const [isUpdatingVote, setIsUpdatingVote] = useState(false)
  const [currentVote, setCurrentVote] = useState<VoteValue>("Neutral")
  const indexClient = useClientsStore(state => state.indexClient)

  const progress = useMemo(() => {
    const totalVotes = currentUpvotes + currentDownvotes

    if (totalVotes === 0) {
      return 50
    }
    return Math.round((currentUpvotes / totalVotes) * 100)
  }, [currentDownvotes, currentUpvotes])

  useEffect(() => {
    setCurrentUpvotes(upvotes ?? 0)
    setCurrentDownvotes(downvotes ?? 0)
  }, [upvotes, downvotes])

  const udpateCounters = useCallback(
    (newVote: VoteValue, oldVote: VoteValue) => {
      let upVotes = currentUpvotes
      let downVotes = currentDownvotes

      if (oldVote === "Up") upVotes -= 1
      if (oldVote === "Down") downVotes -= 1
      if (newVote === "Up") upVotes += 1
      if (newVote === "Down") downVotes += 1

      setCurrentUpvotes(upVotes)
      setCurrentDownvotes(downVotes)
    },
    [currentDownvotes, currentUpvotes]
  )

  const sendVote = useCallback(
    async (vote: VoteValue) => {
      const oldVote = currentVote

      setIsUpdatingVote(true)
      setCurrentVote(vote)

      try {
        await indexClient.videos.vote(videoId, vote)

        udpateCounters(vote, oldVote)
      } catch {
        setCurrentVote(oldVote)
      }

      setIsUpdatingVote(false)
    },
    [currentVote, indexClient.videos, udpateCounters, videoId]
  )

  const giveThumbsUp = useCallback(() => {
    const newVote: VoteValue = currentVote === "Up" ? "Neutral" : "Up"
    sendVote(newVote)
  }, [currentVote, sendVote])

  const giveThumbsDown = useCallback(() => {
    const newVote: VoteValue = currentVote === "Down" ? "Neutral" : "Down"
    sendVote(newVote)
  }, [currentVote, sendVote])

  const shortNumber = useCallback((n: number | undefined) => {
    return n
      ? new Intl.NumberFormat(navigator.language, {
          notation: "compact",
          compactDisplay: "short",
        }).format(n)
      : 0
  }, [])

  return (
    <div
      className={classNames("inline-block min-w-[128px] transition-opacity duration-75", {
        "pointer-events-none opacity-0": isUpdatingVote,
      })}
    >
      <div className="flex justify-between">
        {["Up", "Down"].map(vote => (
          <button
            className={classNames(
              "flex appearance-none items-center rounded-sm border-none bg-transparent px-1.5 py-0.5 shadow-none",
              "text-gray-500 dark:text-gray-400",
              "hover:bg-gray-200 dark:hover:bg-gray-800",
              "active:bg-gray-200/75  dark:active:bg-gray-800/75",
              {
                "text-gray-800 dark:text-gray-50": currentVote === vote,
                "text-gray-400 dark:text-gray-500": currentVote !== vote,
              }
            )}
            onClick={vote === "Up" ? giveThumbsUp : giveThumbsDown}
            disabled={isUpdatingVote}
            aria-label={`${vote}vote`}
            key={vote}
          >
            <span className="inline-block h-5 w-5">
              <VoteIcon className={classNames({ "rotate-180": vote === "Down" })} aria-hidden />
            </span>
            <span className="ml-2 text-sm font-semibold">
              {vote === "Up" ? shortNumber(currentUpvotes) : shortNumber(currentDownvotes)}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
        <div
          className="absolute inset-y-0 left-0 bg-gray-700 transition-all duration-300 dark:bg-gray-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default VideoRating
