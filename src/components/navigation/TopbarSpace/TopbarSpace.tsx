import React from "react"
import classnames from "classnames"

type TopbarSpaceProps = {
  flexible?: boolean
  customWidth?: number
}

const TopbarSpace: React.FC<TopbarSpaceProps> = ({ flexible, customWidth }) => {
  const height = flexible ? "auto" : (customWidth ?? "1.5rem")
  return (
    <div
      className={classnames("topbar-space", { "flex-grow": flexible })}
      style={{ height }}
    />
  )
}

export default TopbarSpace
