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

import classes from "@styles/components/media/VideoSourcePreview.module.scss"

type VideoSourcePreviewProps = {
  name?: string
  statusText?: string
  actionsRender?: React.ReactNode
}

const VideoSourcePreview: React.FC<VideoSourcePreviewProps> = ({ children, name, statusText, actionsRender }) => {
  return (
    <div className={classes.videoSourcePreview}>
      <div className={classes.videoSourcePreviewHeader}>
        <span className={classes.videoSourcePreviewName}>{name}</span>

        <div className={classes.videoSourcePreviewAccessories}>
          {actionsRender && (
            <span className={classes.videoSourcePreviewActions}>{actionsRender}</span>
          )}
          {statusText && (
            <span className={classes.videoSourcePreviewStatus}>{statusText}</span>
          )}
        </div>
      </div>

      <div className={classes.videoSourcePreviewContent}>
        {children}
      </div>
    </div>
  )
}

export default VideoSourcePreview
