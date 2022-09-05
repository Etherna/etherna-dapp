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
import React, { useCallback, useMemo, useRef, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Transition } from "@headlessui/react"
import classNames from "classnames"
import omit from "lodash/omit"

import { MenuAlt4Icon } from "@heroicons/react/outline"
import { ChevronDownIcon } from "@heroicons/react/solid"

export type TabbarProps = {
  children?: React.ReactNode
  className?: string
}

export type TabbarItemProps = {
  children?: React.ReactNode
  as?: React.ElementType
  className?: string
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  isActive?: ((pathname: string) => boolean) | boolean
  isSubmenu?: boolean
  isAccordion?: boolean
  isAccordionItem?: boolean
  onClick?: () => void
}

export type TabbarMenuItemProps = TabbarItemProps & {}

const TabbarItem: React.FC<TabbarItemProps> = ({
  as = "button",
  children,
  className,
  title,
  to,
  target,
  rel,
  iconSvg,
  isActive,
  isSubmenu,
  isAccordion,
  isAccordionItem,
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false
  const [accordionOpen, setAccordionOpen] = useState(false)
  const accordionContent = useRef<HTMLDivElement>(null)

  const As = useMemo(() => {
    if (to && to.startsWith("http")) return "a"
    if (to) return NavLink
    return as
  }, [as, to])

  const accordionChildren = useMemo(() => {
    if (!children) return null
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) return null
      return React.cloneElement(child as React.ReactElement<TabbarItemProps>, {
        isAccordionItem: true,
      })
    })
  }, [children])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isAccordion) {
        setAccordionOpen(open => !open)
      }
      onClick?.()
    },
    [isAccordion, onClick]
  )

  const Wrapper: React.FC<{ children: React.ReactNode }> = useMemo(() => {
    return ({ children }) => (
      <As
        className={classNames(
          "h-14 flex-1 w-full min-w-[15%] max-w-[96px]",
          "flex items-center justify-items-center rounded space-y-0.5 px-4 py-1",
          "cursor-pointer transition-colors duration-300",
          "text-gray-800 dark:text-gray-200",
          "active:bg-gray-200 active:text-gray-800 dark:active:bg-gray-800 dark:active:text-gray-100",
          {
            "flex-col": !isSubmenu,
            "flex-row max-w-none": isSubmenu,
            "text-green-500 active:text-green-500": isCurrentPage,
            "flex-grow flex-wrap": isAccordion,
            "flex-row items-center grow-0 py-1.5": isAccordionItem,
          },
          className
        )}
        href={to && to.startsWith("http") ? to : undefined}
        to={to && !to.startsWith("http") ? to : undefined}
        target={to ? target : undefined}
        rel={to ? rel : undefined}
        onClick={handleClick}
        data-component="tabbar-item"
      >
        {children}
        <span className="ml-1">↗</span>
      </As>
    )
  }, [
    As,
    isCurrentPage,
    isSubmenu,
    isAccordion,
    isAccordionItem,
    className,
    to,
    target,
    rel,
    handleClick,
  ])

  return (
    <Wrapper>
      {iconSvg && (
        <div
          className={classNames("w-5 h-5 shrink-0", {
            "mt-0 mr-5": isSubmenu,
          })}
        >
          {iconSvg}
        </div>
      )}

      {title && (
        <span
          className={classNames("font-semibold whitespace-nowrap", {
            "text-2xs": !isSubmenu,
            "text-sm": isSubmenu,
          })}
        >
          {title}
          {isAccordion && (
            <ChevronDownIcon
              className={classNames("inline ml-2", { "rotate-180": accordionOpen })}
              height={16}
            />
          )}
        </span>
      )}

      {children && (
        <div
          className={classNames("w-full flex items-center", {
            "flex flex-col items-stretch w-full pl-6 max-h-0 overflow-hidden": isAccordion,
            "transition-[max-height] duration-300 ease-in-out": isAccordion,
          })}
          ref={accordionContent}
          style={
            isAccordion
              ? { maxHeight: accordionOpen ? accordionContent.current?.scrollHeight : 0 }
              : undefined
          }
        >
          {accordionChildren}
        </div>
      )}
    </Wrapper>
  )
}

const TabbarMenuItem: React.FC<TabbarMenuItemProps> = props => {
  const [showMenu, setShowMenu] = useState(false)

  const toggleShowMenu = () => {
    setShowMenu(!showMenu)
  }

  return (
    <div className="flex-grow min-w-[15%] max-w-[96px]" data-component="tabbar-menu-item">
      <TabbarItem
        {...omit(props, "children")}
        iconSvg={<MenuAlt4Icon />}
        onClick={toggleShowMenu}
      />

      <Transition
        show={showMenu}
        className="fixed inset-x-0 bottom-0"
        enter="transition duration-100 ease-in"
        enterFrom="translate-y-8 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition duration-75 ease-in"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-8 opacity-0"
        static
      >
        <div
          className={classNames(
            "fixed bottom-16 mb-safe inset-x-0 flex flex-col-reverse p-4 space-y-4 space-y-reverse z-10",
            "bg-gray-50 bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80",
            "border-t border-b border-gray-800/75",
            "backdrop-filter backdrop-blur-lg"
          )}
        >
          {props.children}
        </div>
      </Transition>
    </div>
  )
}

const Tabbar: React.FC<TabbarProps> & {
  Item: typeof TabbarItem
  MenuItem: typeof TabbarMenuItem
} = ({ children, className }) => {
  return (
    <nav
      className={classNames(
        "fixed flex md:hidden bottom-0 inset-x-0",
        "bg-gray-50/80 dark:bg-gray-900/80",
        "backdrop-filter backdrop-blur-lg z-10",
        "pb-safe",
        "[&~main]:mb-20 lg:[&~main]:mb-0",
        className
      )}
      data-tabbar
    >
      <div className="flex items-center justify-center px-1 py-2">{children}</div>
    </nav>
  )
}
Tabbar.Item = TabbarItem
Tabbar.MenuItem = TabbarMenuItem

export default Tabbar
