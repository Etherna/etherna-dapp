import React from "react"
import classnames from "classnames"

import "./video-completion.scss"

import { useVideoEditorState } from "../VideoEditorContext"

const VideoCompletion = () => {
  const { state } = useVideoEditorState()
  const { videoHandler: { video } } = state

  return (
    <ul className="upload-steps mb-4">
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
