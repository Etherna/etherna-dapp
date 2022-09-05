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
import React, { useMemo } from "react"
import { NavLink, useLocation } from "react-router-dom"
import classNames from "classnames"
import omit from "lodash/omit"

import { ChevronDownIcon } from "@heroicons/react/solid"

import { Popup } from "../display"

export type TopbarProps = {
  children?: React.ReactNode
}

export type TopbarLogoProps = {
  className?: string
  logo: React.ReactNode
  logoCompact?: React.ReactNode
  floating?: boolean
}

export type TopbarItemProps = {
  children?: React.ReactNode
  as?: React.ElementType
  className?: string
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  ignoreHoverState?: boolean
  hideMobile?: boolean
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

export type TopbarPopupItemProps = TopbarItemProps & {
  toggle?: React.ReactElement
}

export type TopbarSpaceProps = {
  flexible?: boolean
  customWidth?: number
}

const TopbarItem: React.FC<TopbarItemProps> = ({
  children,
  as = "button",
  title,
  to,
  target,
  rel,
  className,
  prefix,
  suffix,
  ignoreHoverState,
  hideMobile,
  isActive,
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false

  const As = useMemo(() => {
    if (to) return NavLink
    if (!ignoreHoverState) return as
    return "div"
  }, [to, ignoreHoverState, as])

  const Wrapper: React.FC<{ children: React.ReactNode }> = useMemo(() => {
    return ({ children }) => (
      <As
        className={classNames(
          "items-center justify-items-center lg:justify-items-stretch",
          "space-x-2 py-1.5 mx-px sm:mx-2.5 rounded cursor-pointer",
          "transition-colors duration-300 text-gray-800 dark:text-gray-200",
          {
            flex: !hideMobile,
            "hidden md:flex": hideMobile,
            "mx-0 sm:mx-0 px-2.5 md:px-3 active:bg-opacity-50": !ignoreHoverState,
            "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100":
              !ignoreHoverState,
            "active:text-gray-900 dark:active:text-gray-100": !ignoreHoverState,
            "text-gray-900 dark:text-gray-100": isCurrentPage,
          },
          className
        )}
        to={to}
        target={to ? target : undefined}
        rel={to ? rel : undefined}
        onClick={onClick}
      >
        {children}
      </As>
    )
  }, [As, isCurrentPage, to, className, ignoreHoverState, hideMobile, target, rel, onClick])

  return (
    <Wrapper>
      {prefix && <div className="h-6 lg:h-5">{prefix}</div>}
      {title && <span className="hidden lg:inline lg:font-semibold lg:text-sm">{title}</span>}
      {children}
      {suffix && <div className="h-6 lg:h-5 ml-1">{suffix}</div>}
    </Wrapper>
  )
}

const TopbarPopupItemToggle: React.FC<TopbarItemProps> = props => {
  const itemProps = { ...omit(props, "children") }

  return (
    <TopbarItem {...itemProps} as="div">
      {props.children && props.children}
    </TopbarItem>
  )
}

const TopbarPopupItem: React.FC<TopbarPopupItemProps> = props => {
  return (
    <TopbarItem className="p-0">
      <Popup
        toggle={
          <TopbarPopupItemToggle {...props} suffix={<ChevronDownIcon aria-hidden />}>
            {props.toggle}
          </TopbarPopupItemToggle>
        }
        placement="bottom"
        contentClassName="bg-white dark:bg-gray-800"
        adjustSidebar
      >
        {props.children}
      </Popup>
    </TopbarItem>
  )
}

const TopbarLogo: React.FC<TopbarLogoProps> = ({ className, logo, logoCompact, floating }) => {
  const { pathname } = useLocation()

  const dispatchRefresh = () => {
    if (pathname !== "/") return
    window.dispatchEvent(new Event("refresh"))
  }

  return (
    <TopbarItem
      className={classNames(
        {
          "md:hidden": !floating,
          "md:block": floating,
        },
        className
      )}
      to="/"
      ignoreHoverState
    >
      <figure
        className={classNames(
          "h-[26px] lg:mr-4 text-gray-900 dark:text-gray-100",
          "hover:text-gray-900 dark:hover:text-gray-100"
        )}
        onClick={dispatchRefresh}
      >
        {logoCompact && <div className="h-full sm:hidden">{logoCompact}</div>}
        <div className="hidden h-full sm:block">{logo}</div>
      </figure>
    </TopbarItem>
  )
}

const TopbarSpace: React.FC<TopbarSpaceProps> = ({ flexible, customWidth }) => {
  const height = flexible ? "auto" : customWidth ?? "1.5rem"
  return (
    <div className={classNames("topbar-space", { "flex-grow": flexible })} style={{ height }} />
  )
}

const Topbar: React.FC<TopbarProps> & {
  Item: typeof TopbarItem
  PopupItem: typeof TopbarPopupItem
  Logo: typeof TopbarLogo
  Space: typeof TopbarSpace
} = ({ children }) => {
  return (
    <nav
      className={classNames(
        "fixed-sidebar:md:left-20 fixed-sidebar:lg:left-52 fixed-sidebar:xl:left-64",
        "fixed inset-x-0 top-0 flex items-center h-14 px-container py-2.5 z-10 lg:h-16 lg:py-3.5",
        "bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg backdrop-filter",
        "[&~main]:mt-16 [&~main]:lg:mt-20"
      )}
      data-topbar
    >
      {children}
    </nav>
  )
}
Topbar.Item = TopbarItem
Topbar.PopupItem = TopbarPopupItem
Topbar.Logo = TopbarLogo
Topbar.Space = TopbarSpace

export default Topbar
