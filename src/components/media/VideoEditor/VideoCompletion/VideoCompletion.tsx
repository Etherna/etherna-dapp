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
import classnames from "classnames"

import "./video-completion.scss"

import { useVideoEditorState } from "../context"

const VideoCompletion = () => {
  const { state } = useVideoEditorState()
  const { videoHandler: { video } } = state

  return (
    <ul className="upload-steps">
      <li
        className={classnames("upload-step", {
          "step-done": video.sources.length > 0,
        })}
      >
        Upload a video
      </li>
      <li
        className={classnames("upload-step", {
          "step-done": video.title,
        })}
      >
        Add a title
      </li>
      <li
        className={classnames("upload-step", {
          "step-done": video.description,
        })}
      >
        Add a description (optional)
      </li>
      <li
        className={classnames("upload-step", {
          "step-done": !!video.thumbnail,
        })}
      >
        Add a thumbnail (optional)
      </li>
    </ul>
  )
}

export default VideoCompletion
