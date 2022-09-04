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
import React, { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { Menu } from "@headlessui/react"
import classNames from "classnames"

export type DropdownProps = {
  children?: React.ReactNode
  className?: string
}

export type DropdownToggleProps = {
  children?: React.ReactNode
  className?: string
}

export type DropdownMenuProps = {
  children?: React.ReactNode
  className?: string
  open?: boolean
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

const DropdownToggle: React.FC<DropdownToggleProps> = ({ children, className }) => {
  return (
    <Menu.Button
      className={classNames("cursor-pointer z-1 text-gray-800 dark:text-gray-100", className)}
    >
      {children}
    </Menu.Button>
  )
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className, open }) => {
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [menuEl, setMenuEl] = useState<HTMLDivElement>()

  useEffect(() => {
    const updateBounds = () => {
      if (!menuEl) return

      const parentRect = menuEl.offsetParent!.getBoundingClientRect()
      const offsetLeft = parentRect.left + menuEl.offsetLeft

      if (offsetLeft < 10) {
        setStyle({ transform: `translateX(${10 - offsetLeft}px)` })
      }
    }

    menuEl && updateBounds()

    const observer = new ResizeObserver(updateBounds)
    observer.observe(document.documentElement)

    return () => {
      observer.disconnect()
    }
  }, [menuEl])

  return (
    <Menu.Items
      as="div"
      className={classNames(
        "absolute right-0 mt-2 py-1 z-1 w-72 max-w-[90vw] rounded-md shadow-lg",
        "ring-1 ring-black ring-opacity-5 origin-top-right focus:outline-none",
        "border border-transparent dark:border-gray-700",
        "bg-white dark:bg-gray-800 ",
        "opacity-0 scale-y-95 origin-top pointer-events-none transition duration-200 ease-out",
        {
          "opacity-100 scale-y-100 pointer-events-auto": open,
        },
        className
      )}
      style={style}
      ref={(el: HTMLDivElement | null) => el && setMenuEl(el)}
      static
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
        const btnClassName = classNames(
          "relative flex items-center w-full px-8 py-2 whitespace-nowrap",
          "text-sm font-semibold text-gray-700 dark:text-gray-100 transition-colors",
          {
            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100": active && !inactive,
            "pointer-events-none cursor-not-allowed opacity-75": disabled,
          },
          className
        )

        const content = (
          <>
            {icon && <div className="w-5 h-5 mr-2">{icon}</div>}

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

const DropdownSeparator: React.FC = () => {
  return <hr className="my-2" />
}

const Dropdown: React.FC<DropdownProps> & {
  Item: typeof DropdownItem
  Menu: typeof DropdownMenu
  Toggle: typeof DropdownToggle
  Separator: typeof DropdownSeparator
} = ({ children, className }) => {
  return (
    <Menu as="div" className={classNames("relative", className)} data-component="dropdown">
      {children}
    </Menu>
  )
}
Dropdown.Item = DropdownItem
Dropdown.Menu = DropdownMenu
Dropdown.Toggle = DropdownToggle
Dropdown.Separator = DropdownSeparator

export default Dropdown
