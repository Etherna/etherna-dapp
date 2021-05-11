import React from "react"
import classnames from "classnames"

import "./button.scss"

type ButtonProps = {
  children: React.ReactNode
  className?: string
  size?: "small" | "normal" | "large"
  outline?: boolean
  aspect?: "secondary" | "danger" | "warning" | "transparent" | "link" | "link-secondary"
  disabled?: boolean
  rounded?: boolean
  type?: "button" | "submit" | "reset"
  action?: (e: React.SyntheticEvent) => void
}

const Button = ({
  children,
  className,
  size,
  outline,
  aspect,
  action,
  disabled,
  rounded,
  type,
}: ButtonProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target === document.activeElement && e.key === "Enter" && action) {
      action(e)
    }
  }

  return (
    <button
      className={classnames(
        "btn",
        {
          "btn-sm": size === "small",
          "btn-lg": size === "large",
          "btn-outline": outline,
          "btn-rounded": rounded,
          [`btn-${aspect}`]: aspect,
        },
        className
      )}
      type={type}
      onClick={action}
      onKeyDown={handleKeyDown}
      disabled={disabled ? true : false}
    >
      {children}
    </button>
  )
}

export default Button
