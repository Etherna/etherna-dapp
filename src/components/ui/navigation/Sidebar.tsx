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
import React, { useEffect, useMemo, useRef, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Transition } from "@headlessui/react"
import Tippy from "@tippyjs/react"
import classNames from "classnames"

import { ArrowUpIcon, ExternalLinkIcon } from "@heroicons/react/solid"

import { Popup } from "../display"

export type SidebarProps = {
  children?: React.ReactNode
  floating?: boolean
  show?: boolean
  onClose?(): void
}

export type SidebarItemProps = {
  children?: React.ReactNode
  as?: React.ElementType
  className?: string
  iconClassName?: string
  titleClassName?: string
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  compact?: boolean
  isStatic?: boolean
  isResponsive?: boolean
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

export type SidebarLinksProps = {
  children?: React.ReactNode
}

export type SidebarLinksItemProps = {
  children?: React.ReactNode
  as?: React.ElementType
  className?: string
  to?: string
  title?: string
  id?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  tooltip?: string
  isActive?: ((pathname: string) => boolean) | boolean
  disabled?: boolean
  onClick?: () => void
}

export type SidebarLinksListProps = {
  children?: React.ReactNode
  className?: string
}

export type SidebarLogoProps = {
  className?: string
  logo: React.ReactNode
  logoCompact?: React.ReactNode
}

export type SidebarSpaceProps = {
  flexible?: boolean
  customHeight?: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  children,
  as = "button",
  className,
  iconClassName,
  titleClassName,
  title,
  to,
  target,
  rel,
  iconSvg,
  compact,
  isStatic,
  isResponsive = true,
  isActive,
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false

  const As = useMemo(() => {
    if (to) return NavLink
    return as
  }, [as, to])

  const Wrapper: React.FC<{ children: React.ReactNode }> = useMemo(() => {
    return ({ children }) => (
      <As
        className={classNames(
          "flex items-center justify-items-center lg:justify-items-stretch",
          "rounded w-full space-x-3",
          "text-sm text-gray-800 dark:text-gray-200",
          className,
          {
            "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100": isCurrentPage,
            "cursor-pointer transition-colors duration-300": !isStatic,
            "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100":
              !isStatic,
            "px-4 py-3": !compact,
            "py-0": compact,
          }
        )}
        to={to}
        target={to ? target : undefined}
        rel={to ? rel : undefined}
        onClick={onClick}
        data-component="sidebar-item"
      >
        {children}
      </As>
    )
  }, [to, isStatic, compact, target, rel, className, As, isCurrentPage, onClick])

  return (
    <Wrapper>
      {iconSvg && (
        <div
          className={classNames(
            "w-6 h-6 lg:w-5 lg:h-5",
            "floating-sidebar:mx-0 floating-sidebar:w-5 floating-sidebar:h-5",
            {
              "mx-auto lg:mx-0": isResponsive,
            },
            iconClassName
          )}
        >
          {iconSvg}
        </div>
      )}
      {title && (
        <span
          className={classNames(
            "inline text-sm lg:font-semibold",
            "floating-sidebar:font-semibold floating-sidebar:inline",
            {
              "hidden lg:inline": isResponsive,
            },
            titleClassName
          )}
        >
          {title}
        </span>
      )}
      {children}
    </Wrapper>
  )
}

const SidebarLinksToggle: React.FC = () => {
  return (
    <div className="relative" data-component="sidebar-links-toggle">
      <SidebarItem
        className="lg:pointer-events-none lg:hover:bg-transparent"
        iconClassName="lg:hidden"
        iconSvg={<ExternalLinkIcon aria-hidden />}
      />
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 lg:hidden">
        <ArrowUpIcon aria-hidden />
      </div>
    </div>
  )
}

const SidebarLinksList: React.FC<SidebarLinksListProps> = ({ children, className }) => {
  return (
    <div
      className={classNames("flex flex-wrap flex-col lg:flex-row pointer-events-auto", className)}
      data-component="sidebar-links-list"
    >
      {children}
    </div>
  )
}

const SidebarLinksItem: React.FC<SidebarLinksItemProps> = ({
  children,
  as = "button",
  to,
  id,
  className,
  title,
  target,
  rel,
  tooltip,
  isActive,
  disabled,
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false

  const As = useMemo(() => {
    if (to && to.startsWith("http")) return "a"
    if (to) return NavLink
    return as
  }, [as, to])

  const Wrapper: React.FC<{ children: React.ReactNode }> = useMemo(() => {
    return ({ children }) => (
      <As
        className={classNames(
          "block px-0 py-1.5",
          "text-gray-600 dark:text-gray-400 text-left",
          "lg:inline-block lg:w-auto lg:px-0 py-0",
          "after:text-gray-600 after:dark:text-gray-400 after:inline-block after:px-2",
          "after:pointer-events-none after:transition-none",
          "after:content-none lg:after:content-['–']",
          {
            "text-gray-800 dark:text-gray-100": isCurrentPage,
            "lg:hover:bg-transparent hover:text-gray-800 hover:dark:text-gray-100": !disabled,
            "hover:after:text-gray-600 hover:after:dark:text-gray-400": !disabled,
            "opacity-50 cursor-default": disabled,
          },
          className
        )}
        id={id}
        to={to && !to.startsWith("http") ? to : undefined}
        href={to && to.startsWith("http") ? to : undefined}
        target={to ? target : undefined}
        rel={to ? rel : undefined}
        onClick={onClick}
        data-component="sidebar-links-item"
      >
        {children}
      </As>
    )
  }, [As, isCurrentPage, disabled, className, id, to, target, rel, onClick])

  return (
    <Wrapper>
      {tooltip ? (
        <Tippy content={tooltip}>
          <span>
            {title && <span className="lg:text-sm lg:font-normal">{title}</span>}
            {children}
          </span>
        </Tippy>
      ) : (
        <>
          {title && <span className="lg:text-sm lg:font-normal">{title}</span>}
          {children}
        </>
      )}
    </Wrapper>
  )
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ children }) => {
  return (
    <div data-component="sidebar-links">
      <div className="lg:hidden">
        <Popup toggle={<SidebarLinksToggle />} placement="right">
          <SidebarLinksList>{children}</SidebarLinksList>
        </Popup>
      </div>

      <div className="hidden lg:block">
        <SidebarItem as="div" className="pointer-events-none hover:bg-transparent" isStatic>
          <SidebarLinksList className="pointer-events-auto">{children}</SidebarLinksList>
        </SidebarItem>
      </div>
    </div>
  )
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ className, logo, logoCompact }) => {
  const { pathname } = useLocation()

  const dispatchRefresh = () => {
    if (pathname !== "/") return
    window.dispatchEvent(new Event("refresh"))
  }

  return (
    <SidebarItem className={className} to="/" isStatic>
      <figure
        className="h-[26px] text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100 lg:mr-4"
        onClick={dispatchRefresh}
        data-component="sidebar-logo"
      >
        {logoCompact && (
          <div
            className="h-full lg:hidden"
            data-component="sidebar-logo-mobile floating-sidebar:hidden"
          >
            {logoCompact}
          </div>
        )}
        <div
          className="hidden h-full lg:block floating-sidebar:block"
          data-component="sidebar-logo-desktop"
        >
          {logo}
        </div>
      </figure>
    </SidebarItem>
  )
}

const SidebarSpace: React.FC<SidebarSpaceProps> = ({ flexible, customHeight }) => {
  const height = flexible ? "auto" : customHeight ?? "2.25rem"
  return (
    <div
      className={classNames({ "flex-grow": flexible })}
      style={{ height }}
      data-component="sidebar-space"
    />
  )
}

const Sidebar: React.FC<SidebarProps> & {
  Item: typeof SidebarItem
  Links: typeof SidebarLinks
  LinksItem: typeof SidebarLinksItem
  Logo: typeof SidebarLogo
  Space: typeof SidebarSpace
} = ({ children, floating, show, onClose }) => {
  const location = useLocation()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [animateSlide, setAnimateSlide] = useState(show && floating)
  const [showSidebar, setShowSidebar] = useState(show)

  useEffect(() => {
    if (show && floating) {
      setAnimateSlide(true)
    }
    setShowSidebar(show)
  }, [show, floating])

  useEffect(() => {
    setAnimateSlide(false)
  }, [location])

  return (
    <>
      {floating && (
        <Transition
          as={React.Fragment}
          show={showSidebar}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50 z-20" onClick={onClose}></div>
        </Transition>
      )}
      <aside
        className={classNames(
          "hidden px-2.5 py-3 bg-gray-100 dark:bg-gray-800",
          "md:flex md:w-20 md:fixed md:left-0 md:inset-y-0 lg:w-52 xl:w-64",
          {
            "flex w-52 md:w-52 fixed left-0 inset-y-0 transform -translate-x-full z-20": floating,
            "[&+*]:md:pl-20 [&+*]:lg:pl-52 [&+*]:xl:pl-64": !floating,
            "translate-x-0": showSidebar,
            "transition-transform duration-300": animateSlide,
          }
        )}
        ref={sidebarRef}
        data-sidebar
        data-sidebar-floating={`${floating}`}
      >
        <div className="flex flex-col w-full space-y-3 overflow-y-auto">{children}</div>
      </aside>
    </>
  )
}
Sidebar.Item = SidebarItem
Sidebar.Links = SidebarLinks
Sidebar.LinksItem = SidebarLinksItem
Sidebar.Logo = SidebarLogo
Sidebar.Space = SidebarSpace

export default Sidebar
