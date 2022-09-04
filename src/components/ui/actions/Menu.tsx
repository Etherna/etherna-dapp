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
import React, { useContext, useMemo, useState } from "react"
import { usePopper } from "react-popper"

import { Menu as HLMenu } from "@headlessui/react"
import type { Placement } from "@popperjs/core"
import classNames from "classnames"

import { Breakpoint, Drawer } from "../layout"
import UIButton from "./Button"
import type { ButtonProps } from "./Button"

type MenuProps = {
  children: React.ReactNode
  className?: string
}

type MenuItemsProps = {
  children: React.ReactNode
  className?: string
  width?: string | number
  height?: string | number
  placement?: Placement
}

type MenuItemProps = {
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

const MenuButton: React.FC<ButtonProps> = props => {
  const { setButtonEl } = useContext(MenuContext)!

  return (
    <HLMenu.Button
      as="div"
      className="inline-flex relative"
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
  const arrowRotation = useMemo(() => {
    const rotation = state?.placement?.startsWith("top")
      ? 180
      : state?.placement?.startsWith("right")
      ? -90
      : state?.placement?.startsWith("left")
      ? 90
      : 0
    return rotation
  }, [state?.placement])

  return (
    <HLMenu.Items as="span" className="outline-hidden" static data-component="menu-items">
      {({ open }) => (
        <Breakpoint>
          <Breakpoint.Zero>
            <Drawer show={open}>{children}</Drawer>
          </Breakpoint.Zero>
          <Breakpoint.Sm>
            <div
              className={classNames(
                "p-2 rounded-md min-w-[8rem] z-10 outline-hidden pointer-events-none",
                "bg-gray-50 dark:bg-gray-900 shadow-lg",
                "border border-gray-100 dark:border-gray-700",
                "opacity-0 scale-95 transition duration-75 ease-in-out",
                {
                  "opacity-100 scale-100 pointer-events-auto": open,
                }
              )}
              style={{ ...styles.popper, width, height }}
              ref={el => el && setPanelEl(el)}
              {...attributes.popper}
            >
              {buttonEl && (
                <span
                  className="popper-arrow"
                  style={{
                    ...styles.arrow,
                    transform: styles.arrow
                      ? `${styles.arrow.transform} rotate(${arrowRotation}deg)`
                      : undefined,
                  }}
                  ref={el => el && setArrowEl(el)}
                />
              )}
              <div className="w-full h-full overflow-y-auto">{children}</div>
            </div>
          </Breakpoint.Sm>
        </Breakpoint>
      )}
    </HLMenu.Items>
  )
}

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
            "flex items-center text-center text-sm sm:text-left rounded px-2.5 py-2 cursor-pointer",
            "text-gray-500 dark:text-gray-300",
            {
              "text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-700": active && !disabled,
              "text-gray-300 dark:text-gray-600 cursor-default": disabled,
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
  <hr className="block bg-gray-400 dark:bg-gray-600 my-2 -mx-2" />
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
      className={classNames("inline-flex relative", className)}
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
