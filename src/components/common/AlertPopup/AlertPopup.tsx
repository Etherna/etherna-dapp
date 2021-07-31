import React, { useEffect } from "react"
import classnames from "classnames"

import "./alert-popup.scss"
import { ReactComponent as ErrorIcon } from "@svg/icons/warning.svg"
import { ReactComponent as SuccessIcon } from "@svg/icons/check-circle.svg"

type AlertAction = {
  title: string
  type: "default" | "cancel" | "destructive"
  action: () => void
}

type AlertPopupProps = {
  show: boolean
  title?: string
  message?: string
  icon?: "error" | "success" | "info" | string | React.ReactNode
  actions?: AlertAction[]
  onAction?: (type: "default" | "cancel" | "destructive") => void
}

const AlertPopup: React.FC<AlertPopupProps> = ({
  show,
  title,
  message,
  icon,
  actions,
  onAction
}) => {

  useEffect(() => {
    if (show) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const Icon = () => {
    if (icon === "info") {
      return <SuccessIcon />
    }
    if (icon === "success") {
      return <SuccessIcon />
    }
    if (icon === "error") {
      return <ErrorIcon />
    }
    if (typeof icon === "string") {
      return <img src={icon} alt="" />
    }
    return <>{icon}</>
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (actions && actions.length > 0) {
        const defaultAction = actions.find(action => action.type === "default")
        defaultAction?.action()
      } else {
        onAction?.("default")
      }
    }
    if (e.key === "Escape") {
      if (actions && actions.length > 0) {
        const cancelAction = actions.find(action => action.type === "cancel")
        cancelAction?.action()
      } else {
        onAction?.("cancel")
      }
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    return false
  }

  return (
    <div className={classnames("alert-popup-container", { show })} onMouseDown={onMouseDown}>
      <div className={classnames("alert-popup", { show })}>
        {icon && (
          <figure className="alert-popup-icon">
            <Icon />
          </figure>
        )}

        {title && (
          <div className="alert-popup-title">{title}</div>
        )}

        {message && (
          <div className="alert-popup-message">{message}</div>
        )}

        <div className="alert-popup-actions">
          {(!actions || actions.length === 0) && (
            <AlertPopupAction title="OK" type="default" action={() => onAction?.("default")} />
          )}
          {actions && actions.length > 0 && actions.map((action, i) => (
            <AlertPopupAction
              title={action.title}
              type={action.type}
              action={action.action}
              key={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const AlertPopupAction: React.FC<AlertAction> = ({
  title,
  type,
  action,
}) => (
  <button
    className={classnames("alert-popup-btn", `alert-popup-btn-${type}`)}
    onClick={action}
  >
    {title}
  </button>
)

export default AlertPopup
