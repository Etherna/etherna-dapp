import React from "react"
import classnames from "classnames"

export type TabContentProps = {
  children: React.ReactNode
  active?: boolean
  tabKey: string
  title?: string
}

const TabContent = ({ children, active }: TabContentProps) => {
  return (
    <div
      className={classnames("tab-content", {
        active: active,
      })}
    >
      {children}
    </div>
  )
}

export default TabContent
