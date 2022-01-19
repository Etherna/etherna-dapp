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

import React, { ElementType, useMemo } from "react"
import { NavLink, useLocation } from "react-router-dom"
import classNames from "classnames"

import classes from "@styles/components/navigation/SidebarItem.module.scss"

export type SidebarItemProps = {
  as?: ElementType
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  className?: string
  iconClassName?: string
  titleClassName?: string
  compact?: boolean
  isStatic?: boolean
  isResponsive?: boolean
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  children,
  as: As = "button",
  title,
  to,
  target,
  rel,
  iconSvg,
  className,
  iconClassName,
  titleClassName,
  compact,
  isStatic,
  isResponsive = true,
  isActive,
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false

  const Wrapper: React.FC = useMemo(() => {
    return ({ children }) => (
      <>
        {to ? (
          <NavLink
            className={classNames(classes.sidebarItem, className, {
              [classes.static]: isStatic,
              [classes.responsive]: isResponsive,
              [classes.compact]: compact,
            })}
            to={to}
            target={target}
            rel={rel}
            isActive={() => isCurrentPage}
            activeClassName={classes.active}
          >
            {children}
          </NavLink>
        ) : (
          <As
            className={classNames(classes.sidebarItem, {
              [classes.active]: isCurrentPage,
              [classes.static]: isStatic,
              [classes.compact]: compact
            })}
            onClick={onClick}
          >
            {children}
          </As>
        )}
      </>
    )
  }, [to, isStatic, isResponsive, compact, target, rel, className, As, isCurrentPage, onClick])

  return (
    <Wrapper>
      {iconSvg && (
        <div className={classNames(classes.sidebarItemIcon, iconClassName)}>
          {iconSvg}
        </div>
      )}
      {title && (
        <span className={classNames(classes.sidebarItemTitle, titleClassName)}>{title}</span>
      )}
      {children}
    </Wrapper>
  )
}

export default SidebarItem
