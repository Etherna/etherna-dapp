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
import omit from "lodash/omit"

import { ChevronDownIcon } from "@heroicons/react/24/outline"

import { Popup } from "@/components/ui/display"
import { cn } from "@/utils/classnames"

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
  noPadding?: boolean
  hideMobile?: boolean
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

export type TopbarPopupItemProps = TopbarItemProps & {
  toggle?: React.ReactElement
}

export type TopbarGroupProps = {
  children?: React.ReactNode
  className?: string
  leftCorrection?: boolean
  rightCorrection?: boolean
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
  noPadding,
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
        className={cn(
          "items-center justify-items-center lg:justify-items-stretch",
          "h-8 cursor-pointer space-x-2 rounded-md md:h-9",
          "text-gray-800 transition-colors duration-300 dark:text-gray-200",
          {
            "px-1.5 py-1.5 sm:px-3": !noPadding,
            flex: !hideMobile,
            "hidden md:flex": hideMobile,
            "mx-0 active:bg-opacity-50 sm:mx-0": !ignoreHoverState,
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
        data-component="topbar-item"
      >
        {children}
      </As>
    )
  }, [
    As,
    isCurrentPage,
    noPadding,
    hideMobile,
    ignoreHoverState,
    className,
    to,
    target,
    rel,
    onClick,
  ])

  return (
    <Wrapper>
      {prefix && (
        <div
          className={cn({
            "mr-2": title || children,
          })}
        >
          {prefix}
        </div>
      )}
      {title && <span className="hidden lg:inline lg:text-sm lg:font-semibold">{title}</span>}
      {children}
      {suffix && (
        <div
          className={cn({
            "ml-1": title || children,
          })}
        >
          {suffix}
        </div>
      )}
    </Wrapper>
  )
}

const TopbarPopupItemToggle: React.FC<TopbarItemProps> = props => {
  const itemProps = { ...omit(props, "children") }

  return (
    <TopbarItem {...itemProps} noPadding as="div">
      {props.children && props.children}
    </TopbarItem>
  )
}

const TopbarPopupItem: React.FC<TopbarPopupItemProps> = props => {
  return (
    <TopbarItem className="">
      <Popup
        className="flex items-center"
        toggle={
          <TopbarPopupItemToggle
            {...props}
            suffix={<ChevronDownIcon strokeWidth={2} width={12} aria-hidden />}
          >
            {props.toggle}
          </TopbarPopupItemToggle>
        }
        placement="bottom"
        contentClassName="bg-white dark:bg-gray-800 px-2 py-3"
        arrowSize={12}
        adjustSidebar
      >
        {props.children}
      </Popup>
    </TopbarItem>
  )
}

const TopbarGroup: React.FC<TopbarGroupProps> = ({
  children,
  className,
  leftCorrection,
  rightCorrection,
}) => {
  return (
    <div
      className={cn(
        "flex items-center space-x-1 sm:space-x-2 md:space-x-4",
        {
          "-ml-3": leftCorrection,
          "-mr-3": rightCorrection,
        },
        className
      )}
    >
      {children}
    </div>
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
      className={cn(
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
        className={cn(
          "h-[26px] text-gray-900 dark:text-gray-100 lg:mr-4 [&_svg]:h-full",
          "hover:text-gray-900 dark:hover:text-gray-100"
        )}
        onClick={dispatchRefresh}
      >
        {logoCompact && <div className="h-full sm:hidden">{logoCompact}</div>}
        <div className="hidden h-full sm:mr-6 sm:block">{logo}</div>
      </figure>
    </TopbarItem>
  )
}

const TopbarSpace: React.FC<TopbarSpaceProps> = ({ flexible, customWidth }) => {
  const height = flexible ? "auto" : (customWidth ?? "1.5rem")
  return <div className={cn("topbar-space", { "flex-grow": flexible })} style={{ height }} />
}

const Topbar: React.FC<TopbarProps> & {
  Item: typeof TopbarItem
  PopupItem: typeof TopbarPopupItem
  Group: typeof TopbarGroup
  Logo: typeof TopbarLogo
  Space: typeof TopbarSpace
} = ({ children }) => {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-10 flex h-14 items-center px-container py-2.5 lg:h-16",
        "md:fixed-sidebar:left-20 lg:fixed-sidebar:left-52 xl:fixed-sidebar:left-64",
        "floating-sidebar:left-0",
        "bg-white/80 backdrop-blur-xl dark:bg-gray-900/80",
        "border-b border-white/80 dark:border-black/20",
        "[&~main]:min-h-dvh [&~main]:pt-16 [&~main]:lg:pt-20"
      )}
      data-topbar
    >
      {children}
    </nav>
  )
}
Topbar.Item = TopbarItem
Topbar.PopupItem = TopbarPopupItem
Topbar.Group = TopbarGroup
Topbar.Logo = TopbarLogo
Topbar.Space = TopbarSpace

export default Topbar
