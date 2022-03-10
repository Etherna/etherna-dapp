import React from "react"
import classNames from "classnames"

import classes from "@styles/components/video/VideoDetailsButton.module.scss"

type VideoDetailsButtonProps = {
  className?: string
  onClick?(): void
}

const VideoDetailsButton: React.FC<VideoDetailsButtonProps> = ({
  children,
  className,
  onClick
}) => {
  return (
    <button className={classNames(classes.videoDetailsBtn, className)} onClick={onClick}>
      {children}
    </button>
  )
}

export default VideoDetailsButton
