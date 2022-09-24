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

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import { PlayIcon } from "@heroicons/react/20/solid"

import { Popup } from "@/components/ui/display"

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
          "w-full space-x-3 rounded",
          "text-sm text-gray-800 dark:text-gray-200",
          className,
          {
            "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100": isCurrentPage,
            "cursor-pointer transition-colors duration-100": !isStatic,
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
            "h-6 w-6 lg:h-5 lg:w-5",
            "floating-sidebar:mx-0 floating-sidebar:h-5 floating-sidebar:w-5",
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
            "floating-sidebar:inline floating-sidebar:font-semibold",
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
        iconSvg={<ArrowTopRightOnSquareIcon aria-hidden />}
      />
      <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 transform lg:hidden">
        <PlayIcon aria-hidden />
      </div>
    </div>
  )
}

const SidebarLinksList: React.FC<SidebarLinksListProps> = ({ children, className }) => {
  return (
    <div
      className={classNames("pointer-events-auto flex flex-col flex-wrap lg:flex-row", className)}
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
          "text-left text-gray-600 dark:text-gray-400",
          "py-0 lg:inline-block lg:w-auto lg:px-0",
          "after:inline-block after:px-2 after:text-gray-600 after:dark:text-gray-400",
          "after:pointer-events-none after:transition-none",
          "after:content-none last:after:content-none lg:after:content-['-']",
          {
            "text-gray-800 dark:text-gray-100": isCurrentPage,
            "hover:text-gray-800 hover:dark:text-gray-100 lg:hover:bg-transparent": !disabled,
            "hover:after:text-gray-600 hover:after:dark:text-gray-400": !disabled,
            "cursor-default opacity-50": disabled,
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
        <Popup toggle={<SidebarLinksToggle />} placement="right" arrowSize={12}>
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
    <SidebarItem className={className} to="/" isStatic compact>
      <figure
        className="mx-auto text-gray-900 floating-sidebar:ml-4 dark:text-gray-100 lg:ml-0 lg:px-4"
        onClick={dispatchRefresh}
        data-component="sidebar-logo"
      >
        {logoCompact && (
          <div
            className="mx-auto h-[26px] floating-sidebar:hidden lg:hidden [&_svg]:h-full"
            data-component="sidebar-logo-mobile"
          >
            {logoCompact}
          </div>
        )}
        <div
          className="hidden h-[27px] floating-sidebar:block lg:block [&_svg]:h-full"
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
          <div className="fixed inset-0 z-10 bg-gray-900/50" onClick={onClose} />
        </Transition>
      )}
      <aside
        className={classNames(
          "hidden bg-gray-100 px-2.5 py-3 dark:bg-gray-800",
          "md:fixed md:inset-y-0 md:left-0 md:flex md:w-20 lg:w-52 xl:w-64",
          {
            "fixed inset-y-0 left-0 z-20 flex w-52 -translate-x-full transform md:w-52": floating,
            "z-1 [&+*]:md:pl-20 [&+*]:lg:pl-52 [&+*]:xl:pl-64": !floating,
            "translate-x-0": showSidebar,
            "transition-transform duration-300": animateSlide,
          }
        )}
        ref={sidebarRef}
        data-sidebar
        data-sidebar-floating={`${floating}`}
      >
        <div className="flex w-full flex-col space-y-3 overflow-y-auto">{children}</div>
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
