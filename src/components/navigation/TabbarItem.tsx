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

import React, { useMemo, ElementType, useState, useCallback, useRef } from "react"
import { useLocation } from "react-router"
import { NavLink } from "react-router-dom"
import classNames from "classnames"

import classes from "@/styles/components/navigation/TabbarItem.module.scss"
import { ChevronDownIcon } from "@heroicons/react/solid"

export type TabbarItemProps = {
  children?: React.ReactNode
  as?: ElementType
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  isActive?: ((pathname: string) => boolean) | boolean
  isSubmenu?: boolean
  isAccordion?: boolean
  onClick?: () => void
}

const TabbarItem: React.FC<TabbarItemProps> = ({
  as: As = "button",
  children,
  title,
  to,
  target,
  rel,
  iconSvg,
  isActive,
  isSubmenu,
  isAccordion,
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false
  const [accordionOpen, setAccordionOpen] = useState(false)
  const accordionContent = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isAccordion) {
      setAccordionOpen(open => !open)
    }
    onClick?.()
  }, [isAccordion, onClick])

  const Wrapper: React.FC<{ children: React.ReactNode }> = useMemo(() => {
    const className = classNames(classes.tabbarItem, {
      [classes.active]: isCurrentPage,
      [classes.submenu]: isSubmenu,
      [classes.tabbarItemAccordion]: isAccordion,
    })
    return ({ children }) => (
      <>
        {to ? (
          to.startsWith("http") ? (
            <a
              className={className}
              href={to}
              target={target}
              rel={rel}
            >
              {children}
              <span className="ml-1">↗</span>
            </a>
          ) : (
            <NavLink
              className={className}
              to={to}
              target={target}
              rel={rel}
            >
              {children}
            </NavLink>
          )
        ) : (
          <As
            className={className}
            onClick={handleClick}
          >
            {children}
          </As>
        )}
      </>
    )
  }, [to, isCurrentPage, isSubmenu, isAccordion, target, rel, As, handleClick])

  return (
    <Wrapper>
      {iconSvg && (
        <div className={classes.tabbarItemIcon}>
          {iconSvg}
        </div>
      )}

      {title && (
        <span className={classes.tabbarItemTitle}>
          {title}
          {isAccordion && (
            <ChevronDownIcon className={classNames("inline ml-2", { "rotate-180": accordionOpen })} height={16} />
          )}
        </span>
      )}

      {children && (
        <div
          className={classNames(classes.tabbarItemContent)}
          ref={accordionContent}
          style={
            isAccordion ? { maxHeight: accordionOpen ? accordionContent.current?.scrollHeight : 0 } : undefined
          }
        >
          {children}
        </div>
      )}
    </Wrapper>
  )
}

export default TabbarItem
