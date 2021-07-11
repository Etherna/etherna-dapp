import React from "react"
import classnames from "classnames"

import "./video-completion.scss"
import { useVideoEditorState } from "@context/video-editor-context/hooks"

const VideoCompletion = () => {
  const [{ videoHandler }] = useVideoEditorState()
  const { video } = videoHandler

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
