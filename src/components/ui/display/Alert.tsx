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

import { XMarkIcon } from "@heroicons/react/24/outline"

import { cn } from "@/utils/classnames"

export type AlertProps = {
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
        className: cn(
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
      className: cn({
        "text-green-400 dark:text-green-600": color === "success",
        "text-red-400 dark:text-red-600": color === "error",
        "text-yellow-500 dark:text-yellow-600": color === "warning",
        "text-sky-400 dark:text-sky-600": color === "info",
      }),
      width: icon.props.width ?? 20,
      height: icon.props.height ?? 20,
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
      className={cn("rounded-md p-4", className, {
        "bg-green-500/10": color === "success",
        "bg-red-500/10": color === "error",
        "bg-yellow-500/10": color === "warning",
        "bg-sky-500/10": color === "info",
      })}
      data-component="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{styledIcon}</div>
        <div className={cn({ "ml-3": styledIcon })}>
          {title && (
            <h3
              className={cn("mb-2 text-sm font-semibold", {
                "text-green-500": color === "success",
                "text-red-500": color === "error",
                "text-yellow-500": color === "warning",
                "text-sky-500": color === "info",
              })}
            >
              {title}
            </h3>
          )}
          <div
            className={cn("text-sm", {
              "text-green-500": color === "success",
              "text-red-500": color === "error",
              "text-yellow-500": color === "warning",
              "text-sky-500": color === "info",
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
                <XMarkIcon className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert
