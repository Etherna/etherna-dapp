import React from "react"
import classnames from "classnames"

type DropDownItemProps = {
  children: React.ReactNode
  disabled?: boolean
  inactive?: boolean
  action?: () => void
}

const DropDownItem = ({ children, disabled, inactive, action }: DropDownItemProps) => {
  const handleAction = () => {
    action && action()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAction()
    }
  }

  return (
    <div
      className={classnames("dropdown-item", {
        disabled: disabled,
        inactive: inactive,
      })}
      role="button"
      tabIndex={0}
      onClick={handleAction}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

export default DropDownItem
