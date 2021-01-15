import React from "react"

import "./progress-bar.scss"

import { clamp } from "@utils/math"

type ProgressBarProps = {
  progress: number
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  progress = clamp(progress, 0, 100)
  return (
    <div className="progress">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  )
}

export default ProgressBar
