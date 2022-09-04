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
import React, { Fragment, useCallback, useEffect, useMemo } from "react"

import { Dialog, Transition } from "@headlessui/react"
import classNames from "classnames"

import { CheckCircleIcon, ExclamationIcon } from "@heroicons/react/solid"

import { isBotUserAgent } from "@/utils/browser"

export type AlertAction = {
  title: string
  type: "default" | "cancel" | "destructive"
  action: () => void
}

export type AlertPopupProps = {
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
  onAction,
}) => {
  const Icon = useMemo(() => {
    return (props: { className?: string }) => {
      if (icon === "info") {
        return <CheckCircleIcon {...props} />
      }
      if (icon === "success") {
        return <CheckCircleIcon {...props} />
      }
      if (icon === "error") {
        return <ExclamationIcon {...props} />
      }
      if (typeof icon === "string") {
        return <img src={icon} alt="" {...props} />
      }
      return <>{icon}</>
    }
  }, [icon])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
    },
    [actions, onAction]
  )

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    return false
  }, [])

  useEffect(() => {
    if (show) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [show, handleKeyDown])

  if (isBotUserAgent()) return null

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        className={classNames(
          "invisible fixed inset-0 bg-gray-900/0 flex items-center justify-center",
          "transition duration-300 z-200",
          {
            "visible bg-gray-900/60": show,
          }
        )}
        open={show}
        onClose={() => {}}
        tabIndex={0}
        onMouseDown={onMouseDown}
        data-component="alert-popup"
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-90"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-90"
        >
          <Dialog.Panel
            className={classNames(
              "flex flex-col flex-shrink flex-grow-0 basis-72 shadow-2xl max-w-full p-5 -m-2 rounded-lg",
              "bg-gray-100 border border-gray-400 dark:bg-gray-800 dark:border-gray-600"
            )}
          >
            <div className="m-2">
              {icon && (
                <figure
                  className={classNames(
                    "flex items-center justify-center w-16 h-16 mx-auto",
                    "text-gray-500 dark:text-gray-400;"
                  )}
                >
                  <Icon className="w-full h-full object-contain object-center" />
                </figure>
              )}

              {title && (
                <Dialog.Title
                  className={classNames(
                    "text-lg font-bold text-center leading-tight",
                    "text-gray-900 dark:text-gray-100;"
                  )}
                >
                  {title}
                </Dialog.Title>
              )}

              {message && (
                <Dialog.Description
                  className={classNames(
                    "font-semibold text-center leading-tight",
                    "text-gray-700 dark:text-gray-300;"
                  )}
                >
                  {message}
                </Dialog.Description>
              )}

              <div className="flex flex-col space-y-4 -mx-1">
                {(!actions || actions.length === 0) && (
                  <AlertPopupAction
                    title="OK"
                    type="default"
                    action={() => onAction?.("default")}
                  />
                )}
                {actions &&
                  actions.length > 0 &&
                  actions.map((action, i) => (
                    <AlertPopupAction
                      title={action.title}
                      type={action.type}
                      action={action.action}
                      key={i}
                    />
                  ))}
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}

const AlertPopupAction: React.FC<AlertAction> = ({ title, type, action }) => (
  <button
    className={classNames(
      "flex-1 rounded-md p-1.5 m-1 font-semibold text-sm",
      "bg-gray-500 text-gray-100 active:bg-gray-700",
      "focus:ring-0 focus:outline-none transition-colors duration-200",
      {
        "bg-blue-500 active:bg-blue-700": type === "default",
        "bg-red-500 active:bg-red-500": type === "destructive",
      }
    )}
    onClick={action}
  >
    {title}
  </button>
)

export default AlertPopup
