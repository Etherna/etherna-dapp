import React from "react"
import classnames from "classnames"

type DropDownItemContentProps = {
  children: React.ReactNode
  icon?: React.ReactNode
  status?: "active" | "inactive"
}

const DropDownItemContent = ({ children, icon, status }: DropDownItemContentProps) => {
  return (
    <div className="flex items-center w-full">
      {icon}
      <span>{children}</span>
      {status && (
        <span className={classnames("item-status", { [`item-status-${status}`]: status })} />
      )}
    </div>
  )
}

export default DropDownItemContent
