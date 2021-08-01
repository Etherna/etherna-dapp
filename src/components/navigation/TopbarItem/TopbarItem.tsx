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
import classnames from "classnames"

import "./topbar-item.scss"

export type TopbarItemProps = {
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  activeClassName?: string
  ignoreHoverState?: boolean
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

const TopbarItem: React.FC<TopbarItemProps> = ({
  children,
  title,
  to,
  target,
  rel,
  iconSvg,
  activeClassName = "active",
  ignoreHoverState,
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
            className={classnames("topbar-item", { "topbar-item-static": ignoreHoverState })}
            to={to}
            target={target}
            rel={rel}
            isActive={() => isCurrentPage}
            activeClassName={activeClassName}
          >
            {children}
          </NavLink>
        ) : !ignoreHoverState ? (
          <button
            className={classnames("topbar-item", {
              "topbar-item-static": ignoreHoverState,
              [`${activeClassName}`]: isCurrentPage
            })}
            onClick={onClick}
          >
            {children}
          </button>
        ) : (
          <div
            className={classnames("topbar-item", {
              "topbar-item-static": ignoreHoverState,
              [`${activeClassName}`]: isCurrentPage
            })}
            onClick={onClick}
          >
            {children}
          </div>
        )}
      </>
    )
  }, [to, ignoreHoverState, target, rel, activeClassName, isCurrentPage, onClick])


  return (
    <Wrapper>
      {iconSvg && (
        <div className="topbar-item-icon">{iconSvg}</div>
      )}
      {title && (
        <span className="topbar-item-title">{title}</span>
      )}
      {children}
    </Wrapper>
  )
}

export default TopbarItem
