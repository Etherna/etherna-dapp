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

import React, { useState } from "react"
import classnames from "classnames"
import { Popover } from "@headlessui/react"
import { usePopper } from "react-popper"

import "./popup.scss"

type PopupProps = {
  toggle: React.ReactNode
  placement?: "left" | "top" | "right" | "bottom"
  margin?: number
  disabled?: boolean
}

const Popup: React.FC<PopupProps> = ({
  children,
  toggle,
  placement = "bottom",
  disabled,
}) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>()
  const [popperElement, setPopperElement] = useState<HTMLElement | null>()
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>()
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      { name: "preventOverflow", options: { altAxis: true, padding: 4 } },
    ],
  })

  if (disabled && toggle) {
    return toggle as React.ReactElement
  }

  return (
    <Popover as="nav" className="popup">
      {({ open }) => (
        <>
          <Popover.Button as="div" className="popup-toggle" ref={setReferenceElement}>
            {toggle}
          </Popover.Button>

          <Popover.Panel
            className={classnames("popup-panel", { open })}
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <div className="popup-content">
              {children}
            </div>
            <span className="popup-arrow" ref={setArrowElement} style={styles.arrow} />
          </Popover.Panel>

          <Popover.Overlay className="popup-backdrop" />
        </>
      )}
    </Popover>
  )
}

export default Popup
