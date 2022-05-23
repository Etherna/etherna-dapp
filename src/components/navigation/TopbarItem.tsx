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

import classes from "@styles/components/navigation/TopbarItem.module.scss"

export type TopbarItemProps = {
  children?: React.ReactNode
  as?: React.ElementType
  title?: string
  className?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  ignoreHoverState?: boolean
  hideMobile?: boolean
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

const TopbarItem: React.FC<TopbarItemProps> = ({
  children,
  as: As = "button",
  title,
  to,
  target,
  rel,
  className,
  iconSvg,
  ignoreHoverState,
  hideMobile,
  isActive,
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false

  const Wrapper: React.FC<{ children: React.ReactNode }> = useMemo(() => {
    return ({ children }) => (
      <>
        {to ? (
          <NavLink
            className={classNames(classes.topbarItem, className, {
              [classes.active]: isCurrentPage,
              [classes.topbarItemStatic]: ignoreHoverState,
              [classes.hideMobile]: hideMobile,
            })}
            to={to}
            target={target}
            rel={rel}
          >
            {children}
          </NavLink>
        ) : !ignoreHoverState ? (
          <As
            className={classNames(classes.topbarItem, className, {
              [classes.topbarItemStatic]: ignoreHoverState,
              [classes.hideMobile]: hideMobile,
              [classes.active]: isCurrentPage
            })}
            onClick={onClick}
          >
            {children}
          </As>
        ) : (
          <div
            className={classNames(classes.topbarItem, className, {
              [classes.topbarItemStatic]: ignoreHoverState,
              [classes.hideMobile]: hideMobile,
              [classes.active]: isCurrentPage
            })}
            onClick={onClick}
          >
            {children}
          </div>
        )}
      </>
    )
  }, [As, isCurrentPage, to, className, ignoreHoverState, hideMobile, target, rel, onClick])

  return (
    <Wrapper>
      {iconSvg && (
        <div className={classes.topbarItemIcon}>{iconSvg}</div>
      )}
      {title && (
        <span className={classes.topbarItemTitle}>{title}</span>
      )}
      {children}
    </Wrapper>
  )
}

export default TopbarItem
