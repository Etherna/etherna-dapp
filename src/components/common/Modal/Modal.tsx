import React, { Fragment, useRef } from "react"
import classnames from "classnames"
import { Dialog, Transition } from "@headlessui/react"

import "./modal.scss"
import { ReactComponent as XIcon } from "@svg/icons/cross.svg"

import Button from "@common/Button"

type ModalProps = {
  show?: boolean
  title?: string
  icon?: React.ReactNode
  footerButtons?: React.ReactNode
  status?: "danger" | "warning" | "success"
  showCloseButton?: boolean
  showCancelButton?: boolean
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
        className={classnames("modal", {
          "modal-danger": status === "danger",
          "modal-warning": status === "warning",
          "modal-success": status === "success",
        })}
        initialFocus={cancelButtonRef}
        open={show}
        onClose={handleCancel}
      >
        <div className="modal-wrapper">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="modal-overlay" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="modal-spacer" aria-hidden="true">
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
            <div className="modal-dialog">
              {showCloseButton && (
                <div className="modal-close">
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={handleCancel}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className="modal-main">
                <div className="modal-body">
                  {icon && (
                    <div className="modal-icon">
                      {icon}
                    </div>
                  )}
                  <div className="modal-content">
                    {title && (
                      <Dialog.Title as="h3" className="modal-title">
                        {title}
                      </Dialog.Title>
                    )}

                    {children && (
                      <div className="modal-text">
                        {children}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {footerButtons}

                {showCancelButton && (
                  <Button aspect="secondary" action={handleCancel}>Cancel</Button>
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
