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

import classes from "@styles/components/video/VideoDetailsTitleBar.module.scss"

type VideoDetailsTitleBarProps = {
  title?: string | null
}

const VideoDetailsTitleBar: React.FC<VideoDetailsTitleBarProps> = ({ title, children }) => {
  return (
    <div className={classes.videoDetailsTitlebar}>
      <h1 className={classNames(classes.videoDetailsTitle, {
        [classes.untitled]: !title
      })}>
        {title ?? "Untitled"}
      </h1>

      <div className={classes.videoDetailsActions}>
        {children}
      </div>
    </div>
  )
}

export default VideoDetailsTitleBar
