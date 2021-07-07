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
