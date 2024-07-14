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

import React, { Fragment, useCallback, useRef } from "react"
import { Dialog, Transition } from "@headlessui/react"

import { XMarkIcon } from "@heroicons/react/24/solid"

import Button from "./Button"
import { isBotUserAgent } from "@/utils/browser"
import { cn } from "@/utils/classnames"

export type ModalProps = {
  children?: React.ReactNode
  show?: boolean
  title?: string
  icon?: React.ReactNode
  footerButtons?: React.ReactNode
  status?: "error" | "warning" | "success"
  showCloseButton?: boolean
  showCancelButton?: boolean
  autoClose?: boolean
  large?: boolean
  setShow?(show: boolean): void
  onClose?(): void
  onAppeared?(): void
  onDisappeared?(): void
}

const Modal: React.FC<ModalProps> = ({
  children,
  show,
  title,
  icon,
  status,
  footerButtons,
  showCloseButton,
  showCancelButton,
  autoClose,
  large,
  setShow,
  onClose,
  onAppeared,
  onDisappeared,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const handleCancel = useCallback(() => {
    setShow?.(false)
    onClose?.()
  }, [onClose, setShow])

  if (isBotUserAgent()) return null

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        static
        className={cn("fixed inset-0 z-50 overflow-y-auto")}
        initialFocus={cancelButtonRef}
        open={show}
        onClose={() => (autoClose ? handleCancel() : () => {})}
        tabIndex={0}
        data-component="modal"
      >
        <div className="flex min-h-screen items-center justify-center px-4 py-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className={cn("fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity")}
            />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden>
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            afterEnter={onAppeared}
            afterLeave={onDisappeared}
          >
            <div
              className={cn(
                "relative inline-block w-full rounded-lg text-left align-middle sm:my-8 sm:max-w-lg",
                "bg-white shadow-xl dark:bg-gray-700",
                {
                  "sm:max-w-xl": large,
                }
              )}
            >
              {showCloseButton && (
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className={cn(
                      "rounded-md bg-transparent text-gray-400 hover:text-gray-500",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      "focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-gray-700"
                    )}
                    onClick={handleCancel}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden />
                  </button>
                </div>
              )}

              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start sm:space-x-4">
                  {icon && (
                    <div
                      className={cn(
                        "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full",
                        "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-200",
                        "sm:mx-0 sm:h-10 sm:w-10 [&_svg]:w-6",
                        {
                          "bg-green-100 text-green-600": status === "success",
                          "bg-red-100 text-red-600": status === "error",
                          "bg-yellow-100 text-yellow-600": status === "warning",
                        }
                      )}
                    >
                      {icon}
                    </div>
                  )}
                  <div
                    className={cn("flex-1 space-y-2 text-center sm:text-left", {
                      "sm:max-w-[calc(100%-1rem-3rem)]": !!icon,
                    })}
                  >
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                      >
                        {title}
                      </Dialog.Title>
                    )}

                    {children && (
                      <div className="text-sm text-gray-500 dark:text-gray-300">{children}</div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "flex flex-col space-y-3 bg-gray-50 px-4 py-3 dark:bg-gray-900/30",
                  "sm:flex-row-reverse sm:px-6 sm:py-4",
                  "sm:space-x-3 sm:space-y-0 sm:space-x-reverse"
                )}
              >
                {footerButtons}

                {showCancelButton && (
                  <Button color="muted" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Modal
