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

import React, { Fragment, useRef } from "react"
import classNames from "classnames"
import { Dialog, Transition } from "@headlessui/react"

import classes from "@styles/components/common/Modal.module.scss"
import { ReactComponent as XIcon } from "@assets/icons/cross.svg"

import Button from "@common/Button"

type ModalProps = {
  show?: boolean
  title?: string
  icon?: React.ReactNode
  footerButtons?: React.ReactNode
  status?: "danger" | "warning" | "success"
  showCloseButton?: boolean
  showCancelButton?: boolean
  large?: boolean
  setShow?(show: boolean): void
  onClose?(): void
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
  onClose
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const handleCancel = () => {
    setShow?.(false)
    onClose?.()
  }

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        static
        className={classNames(classes.modal, {
          [classes.modalDanger]: status === "danger",
          [classes.modalWarning]: status === "warning",
          [classes.modalSuccess]: status === "success",
          [classes.large]: large,
        })}
        initialFocus={cancelButtonRef}
        open={show}
        onClose={handleCancel}
      >
        <div className={classes.modalWrapper}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className={classes.modalOverlay} />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className={classes.modalSpacer} aria-hidden>
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
          >
            <div className={classes.modalDialog}>
              {showCloseButton && (
                <div className={classes.modalClose}>
                  <button
                    type="button"
                    className={classes.modalCloseBtn}
                    onClick={handleCancel}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden />
                  </button>
                </div>
              )}

              <div className={classes.modalMain}>
                <div className={classes.modalBody}>
                  {icon && (
                    <div className={classes.modalIcon}>
                      {icon}
                    </div>
                  )}
                  <div className={classes.modalContent}>
                    {title && (
                      <Dialog.Title as="h3" className={classes.modalTitle}>
                        {title}
                      </Dialog.Title>
                    )}

                    {children && (
                      <div className={classes.modalText}>
                        {children}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={classes.modalFooter}>
                {footerButtons}

                {showCancelButton && (
                  <Button modifier="secondary" onClick={handleCancel}>Cancel</Button>
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
