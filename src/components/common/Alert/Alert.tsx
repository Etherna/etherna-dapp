import React from "react"
import classnames from "classnames"

import "./alert.scss"

type AlertProps = {
  children: React.ReactNode
  title?: string
  type: "success" | "danger" | "warning" | "info"
  onClose?: () => void
}

const Alert = ({ children, type = "info", title, onClose }: AlertProps) => {
  return (
    <div
      className={classnames("alert", {
        [`alert-${type}`]: type,
      })}
    >
      <div className="alert-header">
        {title && <div className="alert-title">{title}</div>}

        {onClose && (
          <button className="close" onClick={onClose}>
            <span className="m-auto" aria-hidden="true">
              &times;
            </span>
          </button>
        )}
      </div>
      <p>{children}</p>
    </div>
  )
}

export default Alert