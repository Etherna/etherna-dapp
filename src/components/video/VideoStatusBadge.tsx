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

import React from "react"
import classNames from "classnames"

import classes from "@styles/components/video/VideoStatusBadge.module.scss"
import { ReactComponent as UnindexedIcon } from "@assets/icons/unindexed.svg"

type VideoStatusBadgeProps = {
  status: "available" | "unlisted" | "unindexed"
}

const VideoStatusBadge: React.FC<VideoStatusBadgeProps> = ({ status }) => {
  if (status === "available") return null

  const getLabel = () => {
    switch (status) {
      case "unindexed": return "Unindexed"
      case "unlisted": return "Unlisted"
      default: return "nd"
    }
  }

  return (
    <div className={classNames(classes.videoStatusBadge, {
      [classes.unindexed]: status === "unindexed",
      [classes.unlisted]: status === "unlisted",
    })}>
      <UnindexedIcon className="fill-orange-800" />
      {getLabel()}
    </div>
  )
}

export default VideoStatusBadge
