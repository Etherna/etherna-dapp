/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import React, { useEffect } from "react"
import classnames from "classnames"

import "./alert-popup.scss"
import { ReactComponent as ErrorIcon } from "@assets/icons/warning.svg"
import { ReactComponent as SuccessIcon } from "@assets/icons/check-circle.svg"

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
