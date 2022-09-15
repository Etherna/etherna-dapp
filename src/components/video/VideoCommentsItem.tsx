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

import { Avatar } from "../ui/display"
import type { EthAddress } from "@/classes/BeeClient/types"
import MarkdownPreview from "@/components/common/MarkdownPreview"
import VideoCommentPlaceholder from "@/components/placeholders/VideoCommentPlaceholder"
import type { IndexVideoComment } from "@/definitions/api-index"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import routes from "@/routes"
import dayjs from "@/utils/dayjs"
import { shortenEthAddr } from "@/utils/ethereum"

type VideoCommentsItemProps = {
  comment: IndexVideoComment
  videoAuthorAddress?: string | null
}

const VideoCommentsItem: React.FC<VideoCommentsItemProps> = ({ comment, videoAuthorAddress }) => {
  const { creationDateTime, text, ownerAddress } = comment
  const { profile, isLoading, loadProfile } = useSwarmProfile({
    address: ownerAddress as EthAddress,
    fetchFromCache: true,
  })

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment])

  if (isLoading) return <VideoCommentPlaceholder />

  return (
    <div className="mb-3 flex items-start">
      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700">
        <Avatar className="h-full w-full" image={profile?.avatar} address={ownerAddress} />
      </div>
      <div className="ml-2 flex-1">
        <Link
          to={routes.channel(ownerAddress)}
          className={classNames(
            "text-sm font-semibold",
            "text-gray-800 hover:text-black dark:text-gray-300 dark:hover:text-gray-100",
            {
              "rounded-full px-2 py-0.5": videoAuthorAddress === ownerAddress,
              "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200":
                videoAuthorAddress === ownerAddress,
            }
          )}
        >
          {profile?.name || shortenEthAddr(ownerAddress)}
        </Link>
        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
          {dayjs.duration(dayjs(creationDateTime).diff(dayjs())).humanize(true)}
        </span>
        <MarkdownPreview className="mt-1 break-all" value={text} />
      </div>
    </div>
  )
}

export default VideoCommentsItem
