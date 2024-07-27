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

import React, { forwardRef, useState } from "react"
import { usePopper } from "react-popper"
import { Popover } from "@headlessui/react"

import useSidebar from "@/hooks/useSidebar"
import { cn } from "@/utils/classnames"

import type { Placement } from "@popperjs/core"

export type PopupProps = {
  children?: React.ReactNode
  toggle: React.ReactNode
  placement?: "left" | "top" | "right" | "bottom"
  className?: string
  arrowClassName?: string
  contentClassName?: string
  toggleClassName?: string
  arrowSize?: number
  adjustSidebar?: boolean
  disabled?: boolean
}

export type PopupArrowProps = {
  className?: string
  size?: number
  style?: React.CSSProperties
  placement?: Placement
}

const Popup: React.FC<PopupProps> = ({
  children,
  toggle,
  placement = "bottom",
  className,
  arrowClassName,
  contentClassName,
  toggleClassName,
  arrowSize = 14,
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
      { name: "offset", options: { offset: [16, 16] } },
      {
        name: "preventOverflow",
        options: { altAxis: true, padding: 4 + (adjustSidebar ? (sidebarWidth ?? 0) : 0) },
      },
    ],
  })

  if (disabled && toggle) {
    return toggle as React.ReactElement
  }

  return (
    <Popover as="div" className={className} data-component="popup">
      {({ open }) => (
        <>
          <Popover.Button
            as="div"
            className={cn("appearance-none bg-transparent", toggleClassName)}
            ref={setReferenceElement}
          >
            {toggle}
          </Popover.Button>

          <Popover.Panel
            className={cn("absolute z-20", {
              hidden: !open,
              flex: open,
            })}
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <div
              className={cn(
                "min-w-[240px] rounded-md px-6 py-4 shadow-xl sm:max-w-[98vw]",
                "bg-white dark:bg-gray-800",
                contentClassName
              )}
            >
              {children}
            </div>
            <PopupArrow
              className={arrowClassName}
              style={styles.arrow}
              placement={state?.placement}
              size={arrowSize}
              ref={setArrowElement}
            />
          </Popover.Panel>

          <Popover.Overlay className="fixed inset-0 -z-1 bg-transparent" />
        </>
      )}
    </Popover>
  )
}

const PopupArrow = forwardRef<HTMLSpanElement, PopupArrowProps>(
  ({ className, size = 16, style, placement }, ref) => {
    if (!placement) return null
    return (
      <span
        className={cn("block origin-center", className)}
        style={{
          ...style,
          width: size,
          height: size,
          bottom: placement.startsWith("top") ? -size : undefined,
          top: placement.startsWith("bottom") ? -size : undefined,
          right: placement.startsWith("left") ? -size : undefined,
          left: placement.startsWith("right") ? -size : undefined,
        }}
        ref={ref}
      >
        <span
          className={cn(
            "absolute -left-0.5 bottom-0 block h-0 w-0 origin-center",
            "border border-transparent border-t-transparent",
            "border-b-white dark:border-b-gray-800",
            {
              "rotate-90": placement === "right",
            }
          )}
          style={{ borderWidth: size / 2 + 2 }}
        />
        <span
          className={cn(
            "absolute block h-0 w-0",
            "border border-transparent",
            "border-b-white dark:border-b-gray-800",
            {
              "-rotate-90": placement === "right",
              "rotate-90": placement === "left",
              "rotate-180": placement === "top",
            }
          )}
          style={{ borderWidth: size / 2 }}
        />
      </span>
    )
  }
)

export default Popup
