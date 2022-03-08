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

import React, { useMemo, ElementType } from "react"
import { useLocation } from "react-router"
import { NavLink } from "react-router-dom"
import classNames from "classnames"

import classes from "@styles/components/navigation/TabbarItem.module.scss"

export type TabbarItemProps = {
  as?: ElementType
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  isActive?: ((pathname: string) => boolean) | boolean
  isSubmenu?: boolean
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
  onClick,
}) => {
  const { pathname } = useLocation()
  const isCurrentPage = (typeof isActive === "function" ? isActive(pathname) : isActive) ?? false

  const Wrapper: React.FC = useMemo(() => {
    return ({ children }) => (
      <>
        {to ? (
          <NavLink
            className={classNames(classes.tabbarItem, {
              [classes.active]: isCurrentPage,
              [classes.submenu]: isSubmenu
            })}
            to={to}
            target={target}
            rel={rel}
          >
            {children}
          </NavLink>
        ) : (
          <As
            className={classNames(classes.tabbarItem, {
              [classes.active]: isCurrentPage,
              [classes.submenu]: isSubmenu
            })}
            onClick={onClick}
          >
            {children}
          </As>
        )}
      </>
    )
  }, [As, to, target, rel, isSubmenu, isCurrentPage, onClick])

  return (
    <Wrapper>
      {iconSvg && (
        <div className={classes.tabbarItemIcon}>
          {iconSvg}
        </div>
      )}

      {title && (
        <span className={classes.tabbarItemTitle}>{title}</span>
      )}

      {children}
    </Wrapper>
  )
}

export default TabbarItem
