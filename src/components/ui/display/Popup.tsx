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
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { usePopper } from "react-popper"

import { Popover } from "@headlessui/react"
import type { Placement } from "@popperjs/core"
import classNames from "classnames"

import useSidebar from "@/hooks/useSidebar"

export type PopupProps = {
  children?: React.ReactNode
  toggle: React.ReactNode
  placement?: "left" | "top" | "right" | "bottom"
  className?: string
  arrowClassName?: string
  contentClassName?: string
  toggleClassName?: string
  adjustSidebar?: boolean
  disabled?: boolean
}

export type PopupArrowProps = {
  className?: string
  size?: number
  style?: React.CSSProperties
  placement?: Placement
}

const PopupArrow = forwardRef<HTMLSpanElement, PopupArrowProps>(
  ({ className, size = 16, style, placement }, ref) => {
    return (
      <span
        className={classNames(
          "absolute",
          "before:absolute before:visible before:rotate-45",
          "before:border before:border-gray-200 before:dark:border-gray-700",
          "after:absolute after:visible",
          "before:bg-white before:dark:bg-gray-800 after:bg-white after:dark:bg-gray-800",
          placement && {
            "bottom-0 mb-0.5": placement.startsWith("top"),
            "top-0 mt-0.5": placement.startsWith("bottom"),
            "right-0 mr-0.5": placement.startsWith("left"),
            "top-0 ml-0.5": placement.startsWith("right"),
            "after:-mt-[0.5px] after:rotate-45 after:scale-150":
              placement.startsWith("bottom") || placement.startsWith("right"),
            "after:origin-top after:translate-y-[7px] after:translate-x-1/2":
              placement.startsWith("bottom"),
            "after:origin-left after:translate-x-[7px] after:-translate-y-1/2":
              placement.startsWith("right"),
          },
          className
        )}
        style={{
          ...style,
          width: size,
          height: size,
        }}
        ref={ref}
      />
    )
  }
)

const Popup: React.FC<PopupProps> = ({
  children,
  toggle,
  placement = "bottom",
  className,
  arrowClassName,
  contentClassName,
  toggleClassName,
  adjustSidebar,
  disabled,
}) => {
  const { sidebarWidth } = useSidebar()
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>()
  const [popperElement, setPopperElement] = useState<HTMLElement | null>()
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>()
  const { styles, attributes, state } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      {
        name: "preventOverflow",
        options: { altAxis: true, padding: 4 + (adjustSidebar ? sidebarWidth ?? 0 : 0) },
      },
    ],
  })

  if (disabled && toggle) {
    return toggle as React.ReactElement
  }

  return (
    <Popover as="nav" className={classNames("block", className)}>
      {({ open }) => (
        <>
          <Popover.Button
            as="div"
            className={classNames("appearance-none bg-transparent", toggleClassName)}
            ref={setReferenceElement}
          >
            {toggle}
          </Popover.Button>

          <Popover.Panel
            className={classNames(
              "absolute opacity-0 pointer-events-none transition-opacity duration-75 z-20",
              state?.placement && {
                "mb-4": state.placement.startsWith("top"),
                "mt-4": state.placement.startsWith("bottom"),
                "mr-4": state.placement.startsWith("left"),
                "ml-4": state.placement.startsWith("right"),
              },
              {
                "visible pointer-events-auto opacity-100": open,
              }
            )}
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <div
              className={classNames(
                "px-6 py-4 rounded-md min-w-[240px] max-w-sm shadow-xl",
                "bg-white before:dark:bg-gray-800",
                state?.placement && {
                  "mb-2.5 py-6": state.placement.startsWith("top"),
                  "mt-2.5 py-6": state.placement.startsWith("bottom"),
                  "mr-2.5": state.placement.startsWith("left"),
                  "ml-2.5": state.placement.startsWith("right"),
                },
                contentClassName
              )}
            >
              {children}
            </div>
            <PopupArrow
              className={arrowClassName}
              style={styles.arrow}
              placement={state?.placement}
              ref={setArrowElement}
            />
          </Popover.Panel>

          <Popover.Overlay className="fixed inset-0 -z-1 bg-transparent" />
        </>
      )}
    </Popover>
  )
}

export default Popup
