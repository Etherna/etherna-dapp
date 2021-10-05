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
import classNames from "classnames"
import { Popover } from "@headlessui/react"
import { usePopper } from "react-popper"

import classes from "@styles/components/common/Popup.module.scss"

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
    <Popover as="nav" className={classes.popup}>
      {({ open }) => (
        <>
          <Popover.Button as="div" className={classes.popupToggle} ref={setReferenceElement}>
            {toggle}
          </Popover.Button>

          <Popover.Panel
            className={classNames(classes.popupPanel, { open })}
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <div className={classes.popupContent}>
              {children}
            </div>
            <span className={classes.popupArrow} ref={setArrowElement} style={styles.arrow} />
          </Popover.Panel>

          <Popover.Overlay className={classes.popupBackdrop} />
        </>
      )}
    </Popover>
  )
}

export default Popup