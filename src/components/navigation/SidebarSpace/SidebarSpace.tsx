import React from "react"
import classnames from "classnames"

type SidebarSpaceProps = {
  flexible?: boolean
  customHeight?: string
}

const SidebarSpace: React.FC<SidebarSpaceProps> = ({ flexible, customHeight }) => {
  const height = flexible ? "auto" : (customHeight ?? "2.25rem")
  return (
    <div
      className={classnames("sidebar-space", { "flex-grow": flexible })}
      style={{ height }}
    />
  )
}

export default SidebarSpace
