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

import React from "react"
import classnames from "classnames"

import "./modal.scss"

type ModalProps = {
  children: React.ReactNode
  show?: boolean
  setShow?: (show: boolean) => void
  title?: string
  titleTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  showCloseButton?: boolean
  onClose?: () => void
}

const Modal = ({
  children,
  show,
  setShow,
  title,
  titleTag: TitleTag = "h5",
  showCloseButton,
  onClose
}: ModalProps) => {

  const handleToggle = () => {
    setShow && setShow(!show)
    onClose && onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleToggle()
    }
  }

  return (
    <>
      <div className={classnames("modal", { show: show })}>
        <div className="modal-dialog">
          {((title && title !== "") || showCloseButton) && (
            <div className="modal-header">
              <TitleTag className="modal-title">{title}</TitleTag>
              <div
                className="close"
                role="button"
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
          {children}
        </div>
      </div>
      <div
        className={classnames("modal-backdrop", { show: show })}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      />
    </>
  )
}

export default Modal
