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

import React, { useCallback, useMemo } from "react"

import classNames from "classnames"

import { XIcon } from "@heroicons/react/outline"

type AlertProps = {
  children?: React.ReactNode
  className?: string
  title?: string
  color?: "success" | "warning" | "error" | "info"
  icon?: JSX.Element
  actions?: JSX.Element
  actionsPosition?: "right" | "bottom"
  showCloseButton?: boolean
  small?: boolean
  onClose?(): void
}

const Alert: React.FC<AlertProps> = ({
  children,
  className,
  title,
  color = "success",
  icon,
  actions,
  actionsPosition = "right",
  showCloseButton,
  small,
  onClose,
}) => {
  const styleButton = useCallback(
    (element: JSX.Element) => {
      return React.cloneElement(element, {
        className: classNames(
          "font-medium whitespace-nowrap",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          {
            "rounded-md px-2 py-1.5 text-sm": !small,
            "rounded px-1.5 py-1 text-xs": small,
          },
          {
            "bg-green-100 text-green-800 hover:bg-green-200 focus:ring-offset-green-100 focus:ring-green-600":
              color === "success",
            "bg-red-100 text-red-800 hover:bg-red-200 focus:ring-offset-red-100 focus:ring-red-600":
              color === "error",
            "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-offset-yellow-100 focus:ring-yellow-600":
              color === "warning",
            "bg-sky-100 text-sky-800 hover:bg-sky-200 focus:ring-offset-sky-100 focus:ring-sky-600":
              color === "info",
          }
        ),
      })
    },
    [color, small]
  )

  const styledIcon = useMemo(() => {
    if (!icon) return undefined
    return React.cloneElement(icon, {
      className: classNames("h-5 w-5", {
        "text-green-400": color === "success",
        "text-red-400": color === "error",
        "text-yellow-500": color === "warning",
        "text-sky-400": color === "info",
      }),
    })
  }, [icon, color])

  const styledActions = useMemo(() => {
    if (!actions) return undefined
    if (actions.type === React.Fragment) {
      return (React.Children.toArray(actions.props.children) as JSX.Element[]).map(styleButton)
    }
    return styleButton(actions)
  }, [actions, styleButton])

  return (
    <div
      className={classNames("rounded-md p-4", className, {
        "bg-green-100": color === "success",
        "bg-red-100": color === "error",
        "bg-yellow-100": color === "warning",
        "bg-sky-100": color === "info",
      })}
      data-component="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{styledIcon}</div>
        <div className="ml-3">
          <h3
            className={classNames("text-sm font-semibold", {
              "text-green-800": color === "success",
              "text-red-800": color === "error",
              "text-yellow-800": color === "warning",
              "text-sky-800": color === "info",
            })}
          >
            {title}
          </h3>
          <div
            className={classNames("mt-2 text-sm", {
              "text-green-700": color === "success",
              "text-red-700": color === "error",
              "text-yellow-700": color === "warning",
              "text-sky-700": color === "info",
            })}
          >
            {children}
          </div>

          {styledActions && actionsPosition === "bottom" && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">{styledActions}</div>
            </div>
          )}
        </div>

        {styledActions && actionsPosition === "right" && (
          <div className="ml-4">
            <div className="flex">{styledActions}</div>
          </div>
        )}

        {showCloseButton && (
          <div className="ml-4">
            {styleButton(
              <button onClick={onClose}>
                <XIcon className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert
