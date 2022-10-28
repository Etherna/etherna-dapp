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

import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid"

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
        return <ExclamationTriangleIcon {...props} />
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
    <Transition show={show} as={Fragment} appear>
      <Dialog
        as="div"
        className={classNames(
          "fixed inset-0 flex items-center justify-center bg-gray-900/0",
          "z-200 transition duration-300",
          "focus:outline-none focus-visible:outline-none",
          {
            invisible: !show,
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
              "-m-2 flex max-w-full flex-shrink flex-grow-0 basis-72 flex-col rounded-lg p-5 shadow-2xl",
              "border border-gray-400 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
            )}
          >
            <div className="m-2">
              {icon && (
                <figure
                  className={classNames(
                    "mx-auto mb-3 flex h-16 w-16 items-center justify-center",
                    "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <Icon className="h-full w-full object-contain object-center" />
                </figure>
              )}

              {title && (
                <Dialog.Title
                  className={classNames(
                    "text-center text-lg font-bold leading-tight",
                    "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {title}
                </Dialog.Title>
              )}

              {message && (
                <Dialog.Description
                  className={classNames(
                    "mt-2 text-center font-semibold leading-tight",
                    "text-gray-700 dark:text-gray-400"
                  )}
                >
                  {message}
                </Dialog.Description>
              )}

              <div className="-mx-1 mt-4 flex flex-col space-y-2">
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
    </Transition>
  )
}

const AlertPopupAction: React.FC<AlertAction> = ({ title, type, action }) => (
  <button
    className={classNames(
      "m-1 flex-1 rounded-md p-1.5 text-sm font-semibold",
      "bg-gray-500 text-gray-100 active:bg-gray-700",
      "transition-colors duration-200 focus:outline-none focus:ring-0",
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
