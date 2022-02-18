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

import classes from "@styles/components/video/VideoDetailsInfoBar.module.scss"

import dayjs from "@utils/dayjs"

type VideoDetailsInfoBarProps = {
  createdAt?: number | null
}

const VideoDetailsInfoBar: React.FC<VideoDetailsInfoBarProps> = ({ createdAt }) => {
  return (
    <div className={classes.videoDetailsInfoBar}>
      <div className={classes.videoDetailsStats}>
        {createdAt && (
          <span className={classes.videoDetailsPublishTime}>
            {dayjs(createdAt).format("LLL")}
          </span>
        )}
      </div>
    </div>
  )
}

export default VideoDetailsInfoBar
