import React from "react"
import classnames from "classnames"

export type ProgressTabContentProps = {
  children: React.ReactNode
  tabKey: string
  active?: boolean
  title?: string
}

const ProgressTabContent: React.FC<ProgressTabContentProps> = ({ children, active }) => {
  return (
    <div
      className={classnames("progresstab-content", {
        active: active,
      })}
    >
      {children}
    </div>
  )
}

export default ProgressTabContent
