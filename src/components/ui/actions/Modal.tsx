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
import classNames from "classnames"

import classes from "@/styles/components/common/Modal.module.scss"
import { XIcon } from "@heroicons/react/solid"

import Button from "./Button"
import { isBotUserAgent } from "@/utils/browser"

type ModalProps = {
  children?: React.ReactNode
  show?: boolean
  title?: string
  icon?: React.ReactNode
  footerButtons?: React.ReactNode
  status?: "error" | "warning" | "success"
  showCloseButton?: boolean
  showCancelButton?: boolean
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
        className={classNames("fixed inset-0 overflow-y-auto z-100")}
        initialFocus={cancelButtonRef}
        open={show}
        onClose={handleCancel}
        tabIndex={0}
        data-component="modal"
      >
        <div className="flex items-center justify-center min-h-screen py-4 px-4 text-center">
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
              className={classNames(
                "fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-800/50"
              )}
            />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden>
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
              className={classNames(
                "relative inline-block align-middle rounded-lg text-left overflow-hidden w-full sm:my-8 sm:max-w-lg",
                "bg-white dark:bg-gray-700 shadow-xl",
                {
                  "sm:max-w-xl": large,
                }
              )}
            >
              {showCloseButton && (
                <div className="hidden absolute top-0 right-0 pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className={classNames(
                      "bg-transparent rounded-md text-gray-400 hover:text-gray-500",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      "focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-gray-700"
                    )}
                    onClick={handleCancel}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden />
                  </button>
                </div>
              )}

              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:space-x-4 sm:flex sm:items-start">
                  {icon && (
                    <div
                      className={classNames(
                        "flex-shrink-0 flex items-center justify-center mx-auto h-12 w-12 rounded-full",
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
                  <div className="flex-1 text-center space-y-2 sm:text-left sm:max-w-[calc(100%-1rem-3rem)]">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
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
                className={classNames(
                  "px-4 py-3 bg-gray-50 dark:bg-gray-900/30 space-y-3 sm:space-y-0",
                  "sm:px-6 sm:flex sm:flex-row-reverse",
                  "[&>*]:w-full [&>*]:ml-3 [&>*]:last:ml-0 [&>*]:sm:w-auto"
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
