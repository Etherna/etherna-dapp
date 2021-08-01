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
import { useLocation } from "react-router"
import { NavLink } from "react-router-dom"
import classnames from "classnames"

import "./tabbar-item.scss"

export type TabbarItemProps = {
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  activeClassName?: string
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

const TabbarItem: React.FC<TabbarItemProps> = ({
  children,
  title,
  to,
  target,
  rel,
  iconSvg,
  activeClassName = "active",
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
            className={classnames("tabbar-item")}
            to={to}
            target={target}
            rel={rel}
            isActive={() => isCurrentPage}
            activeClassName={activeClassName}
          >
            {children}
          </NavLink>
        ) : (
          <button
            className={classnames("tabbar-item", { [`${activeClassName}`]: isCurrentPage })}
            onClick={onClick}
          >
            {children}
          </button>
        )}
      </>
    )
  }, [to, target, rel, activeClassName, isCurrentPage, onClick])

  return (
    <Wrapper>
      {children ? (
        children
      ) : (
        <>
          <div className="tabbar-item-icon">
            {iconSvg}
          </div>
          <span className="tabbar-item-title">{title}</span>
        </>
      )}
    </Wrapper>
  )
}

export default TabbarItem
