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

import React, { forwardRef, useContext, useState } from "react"
import { usePopper } from "react-popper"
import { Menu as HLMenu } from "@headlessui/react"
import type { Placement } from "@popperjs/core"
import classNames from "classnames"

import { Drawer } from "../display"
import { Breakpoint } from "../layout"
import UIButton from "./Button"
import type { ButtonProps } from "./Button"

export type MenuProps = {
  children: React.ReactNode
  className?: string
}

export type MenuItemsProps = {
  children: React.ReactNode
  className?: string
  width?: string | number
  height?: string | number
  placement?: Placement
}

export type MenuItemProps = {
  children: React.ReactNode
  className?: string
  href?: string
  rel?: string
  target?: "_blank"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "alert"
  disabled?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onClick?(): void
}

export type MenuArrowProps = {
  className?: string
  size?: number
  style?: React.CSSProperties
  placement?: Placement
}

const MenuButton: React.FC<ButtonProps> = props => {
  const { setButtonEl } = useContext(MenuContext)!

  return (
    <HLMenu.Button
      as="div"
      className="relative inline-flex"
      ref={(el: HTMLDivElement) => {
        el && setButtonEl(el)
      }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      data-component="menu-button"
    >
      <UIButton {...props}>{props.children}</UIButton>
    </HLMenu.Button>
  )
}

const MenuItems: React.FC<MenuItemsProps> = ({ children, width, height, placement = "bottom" }) => {
  const { buttonEl, panelEl, setPanelEl } = useContext(MenuContext)!
  const [arrowEl, setArrowEl] = useState<HTMLSpanElement>()
  const { styles, attributes, state } = usePopper(buttonEl, panelEl, {
    modifiers: [
      {
        name: "arrow",
        options: {
          element: arrowEl,
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, 12],
        },
      },
      {
        name: "computeStyles",
        options: {
          adaptive: false,
        },
      },
    ],
    placement,
  })

  return (
    <HLMenu.Items as="span" className="focus:outline-0" static data-component="menu-items">
      {({ open }) => (
        <Breakpoint>
          <Breakpoint.Zero>
            <Drawer show={open}>{children}</Drawer>
          </Breakpoint.Zero>
          <Breakpoint.Sm>
            <div
              className={classNames(
                "z-100 min-w-[8rem] rounded-md p-2 outline-hidden",
                "bg-gray-50 shadow-lg dark:bg-gray-900",
                "border border-gray-100 dark:border-gray-700",
                "transition duration-75 ease-in-out",
                {
                  "pointer-events-none scale-95 opacity-0": !open,
                  "pointer-events-auto scale-100 opacity-100": open,
                }
              )}
              style={{ ...styles.popper, width, height }}
              ref={el => el && setPanelEl(el)}
              {...attributes.popper}
            >
              {buttonEl && (
                <MenuArrow
                  placement={state?.placement}
                  style={styles.arrow}
                  ref={el => el && setArrowEl(el)}
                />
              )}
              <div className="h-full w-full overflow-y-auto">{children}</div>
            </div>
          </Breakpoint.Sm>
        </Breakpoint>
      )}
    </HLMenu.Items>
  )
}

const MenuArrow = forwardRef<HTMLSpanElement, MenuArrowProps>(
  ({ className, style, placement }, ref) => {
    if (!placement) return null
    return (
      <span
        className={classNames(
          "block h-3 w-3",
          "before:absolute before:-left-0.5 before:bottom-0 before:block before:h-0 before:w-0",
          "before:border-[8px] before:border-transparent before:border-t-transparent",
          "before:border-b-gray-100 before:dark:border-b-gray-700",
          "after:absolute after:block after:h-0 after:w-0",
          "after:border-[6px] after:border-transparent",
          "after:border-b-gray-50 after:dark:border-b-gray-900",
          placement && {
            "-bottom-3": placement.startsWith("top"),
            "-top-3": placement.startsWith("bottom"),
            "-right-3": placement.startsWith("left"),
            "-left-3": placement.startsWith("right"),
          },
          className
        )}
        style={{
          ...style,
        }}
        ref={ref}
      />
    )
  }
)

const MenuItem: React.FC<MenuItemProps> = ({
  children,
  className,
  color,
  href,
  rel,
  target,
  disabled,
  prefix,
  suffix,
  onClick,
}) => {
  const As = href ? "a" : "div"
  return (
    <HLMenu.Item>
      {({ active }) => (
        <As
          className={classNames(
            "flex cursor-pointer items-center rounded px-2.5 py-2 text-center text-sm sm:text-left",
            "text-gray-500 dark:text-gray-300",
            {
              "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50": active && !disabled,
              "cursor-default text-gray-300 dark:text-gray-600": disabled,
              "text-gray-400 dark:text-gray-600": color === "secondary",
              "text-gray-600 dark:text-gray-200": color === "secondary" && active && !disabled,
              "text-blue-500 dark:text-blue-500": color === "success",
              "text-blue-600 dark:text-blue-400": color === "success" && active && !disabled,
              "text-yellow-500 dark:text-yellow-500": color === "warning",
              "text-yellow-600 dark:text-yellow-400": color === "warning" && active && !disabled,
              "text-red-500 dark:text-red-500": color === "error",
              "text-red-600 dark:text-red-400": color === "error" && active && !disabled,
              "text-pink-500 dark:text-pink-500": color === "alert",
              "text-pink-600 dark:text-pink-400": color === "alert" && active && !disabled,
            },
            className
          )}
          href={href}
          rel={rel}
          target={target}
          onClick={onClick}
          data-component="menu-item"
        >
          {prefix && <span className="mr-2 [&_svg]:w-[1.1em]">{prefix}</span>}
          {children}
          {suffix && <span className="ml-auto [&_svg]:w-[1.1em]">{suffix}</span>}
        </As>
      )}
    </HLMenu.Item>
  )
}

const MenuSeparator: React.FC = () => (
  <hr className="my-2 -mx-2 block bg-gray-400 dark:bg-gray-600" />
)

const MenuContext = React.createContext<
  | {
      buttonEl: HTMLElement | undefined
      setButtonEl: (btn: HTMLElement) => void
      panelEl: HTMLElement | undefined
      setPanelEl: (btn: HTMLElement) => void
    }
  | undefined
>(undefined)

const Menu: React.FC<MenuProps> & {
  Item: typeof MenuItem
  Button: typeof MenuButton
  Items: typeof MenuItems
  Separator: typeof MenuSeparator
} = ({ children, className }) => {
  const [buttonEl, setButtonEl] = useState<HTMLElement>()
  const [panelEl, setPanelEl] = useState<HTMLElement>()

  return (
    <HLMenu
      as="div"
      className={classNames("relative inline-flex", className)}
      data-component="menu"
    >
      <MenuContext.Provider
        value={{
          buttonEl,
          setButtonEl,
          panelEl,
          setPanelEl,
        }}
      >
        {children}
      </MenuContext.Provider>
    </HLMenu>
  )
}
Menu.Item = MenuItem
Menu.Button = MenuButton
Menu.Items = MenuItems
Menu.Separator = MenuSeparator

export default Menu
