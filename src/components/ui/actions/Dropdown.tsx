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

import React, { useCallback, useContext, useState } from "react"
import { usePopper } from "react-popper"
import { Link } from "react-router-dom"
import { Menu } from "@headlessui/react"

import { cn } from "@/utils/classnames"

import type { Placement } from "@popperjs/core"

export type DropdownProps = {
  children?: React.ReactNode
  className?: string
}

export type DropdownToggleProps = {
  children?: React.ReactNode
  className?: string
  disabled?: boolean
}

export type DropdownMenuProps = {
  children?: React.ReactNode
  className?: string
  placement?: Placement
}

export type DropdownGroupProps = {
  children?: React.ReactNode
  className?: string
}

export type DropdownItemProps = {
  children?: React.ReactNode
  className?: string
  href?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
  disabled?: boolean
  inactive?: boolean
  btnAs?: React.ElementType
  action?(): void
}

const DropdownToggle: React.FC<DropdownToggleProps> = ({ children, className, disabled }) => {
  const { setButtonEl } = useContext(DropdownContext)!
  return (
    <Menu.Button
      className={cn("z-1 inline-flex cursor-pointer text-gray-800 dark:text-gray-100", className)}
      ref={(el: HTMLButtonElement) => {
        el && setButtonEl(el)
      }}
      disabled={disabled}
      data-component="dropdown-toggle"
    >
      {children}
    </Menu.Button>
  )
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  className,
  placement = "bottom",
}) => {
  const { buttonEl, menuEl, setMenuEl } = useContext(DropdownContext)!
  const { styles, attributes } = usePopper(buttonEl, menuEl, {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [12, 12],
        },
      },
      {
        name: "preventOverflow",
        options: { altAxis: true, padding: 8 },
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
    <Menu.Items
      as="div"
      className={({ open }) =>
        cn(
          "absolute right-0 z-1 w-72 max-w-[90vw] rounded-md py-1 shadow-lg",
          "origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none",
          "border border-transparent dark:border-gray-700",
          "bg-white dark:bg-gray-800",
          "pointer-events-none origin-top transition duration-200 ease-out",
          {
            "-translate-y-4 scale-y-95 opacity-0": !open,
            "pointer-events-auto translate-y-0 scale-y-100 opacity-100": open,
          },
          className
        )
      }
      static
      style={{ ...styles.popper }}
      ref={(el: HTMLDivElement) => el && setMenuEl(el)}
      {...attributes.popper}
      data-component="dropdown-menu"
    >
      {children}
    </Menu.Items>
  )
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  className,
  href = "#",
  icon,
  suffix,
  disabled,
  inactive,
  btnAs: BtnAs = "button",
  action,
}) => {
  const handleAction = useCallback(
    (e: MouseEvent) => {
      if (action || href === "#") {
        e.preventDefault()
        e.stopPropagation()

        action?.()

        return false
      }
    },
    [action, href]
  )

  return (
    <Menu.Item as="div" disabled={disabled || inactive} data-component="dropdown-item">
      {({ active }) => {
        const btnClassName = cn(
          "relative flex items-center w-full px-8 py-1 sm:py-2 whitespace-nowrap",
          "text-sm font-semibold text-gray-700 dark:text-gray-100 transition-colors",
          {
            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100": active && !inactive,
            "pointer-events-none cursor-not-allowed opacity-75": disabled,
          },
          className
        )

        const content = (
          <>
            {icon && <div className="mr-2 flex h-5 w-5 items-center [&>*]:w-full">{icon}</div>}

            {children}

            {suffix && <div className="ml-auto">{suffix}</div>}
          </>
        )

        if (href === "#") {
          return (
            <BtnAs
              className={btnClassName}
              onClick={(e: React.MouseEvent) => handleAction(e.nativeEvent)}
            >
              {content}
            </BtnAs>
          )
        }

        return (
          <Link to={href} className={btnClassName} onClick={e => handleAction(e.nativeEvent)}>
            {content}
          </Link>
        )
      }}
    </Menu.Item>
  )
}

const DropdownGroup: React.FC<DropdownGroupProps> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col py-1 sm:py-2", className)} data-component="dropdown-group">
      {children}
    </div>
  )
}

const DropdownSeparator: React.FC = () => {
  return <hr className="" />
}

const DropdownContext = React.createContext<
  | {
      buttonEl: HTMLElement | undefined
      setButtonEl: (btn: HTMLElement) => void
      menuEl: HTMLElement | undefined
      setMenuEl: (menu: HTMLElement) => void
    }
  | undefined
>(undefined)

const Dropdown: React.FC<DropdownProps> & {
  Item: typeof DropdownItem
  Menu: typeof DropdownMenu
  Group: typeof DropdownGroup
  Toggle: typeof DropdownToggle
  Separator: typeof DropdownSeparator
} = ({ children, className }) => {
  const [buttonEl, setButtonEl] = useState<HTMLElement>()
  const [menuEl, setMenuEl] = useState<HTMLElement>()

  return (
    <Menu as="div" className={cn("relative inline-flex", className)} data-component="dropdown">
      <DropdownContext.Provider
        value={{
          buttonEl,
          setButtonEl,
          menuEl,
          setMenuEl,
        }}
      >
        {children}
      </DropdownContext.Provider>
    </Menu>
  )
}
Dropdown.Item = DropdownItem
Dropdown.Menu = DropdownMenu
Dropdown.Group = DropdownGroup
Dropdown.Toggle = DropdownToggle
Dropdown.Separator = DropdownSeparator

export default Dropdown
