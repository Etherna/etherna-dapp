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
import { useLocation } from "react-router"
import { NavLink } from "react-router-dom"
import classNames from "classnames"

import classes from "@styles/components/navigation/SidebarLinksListItem.module.scss"

type SidebarLinksItemProps = {
  as?: ElementType
  to?: string
  title?: string
  id?: string
  className?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  activeClassName?: string
  isActive?: ((pathname: string) => boolean) | boolean
  onClick?: () => void
}

const SidebarLinksItem: React.FC<SidebarLinksItemProps> = ({
  children,
  as: As = "button",
  to,
  id,
  className,
  title,
  target,
  rel,
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
            className={classNames(classes.sidebarLinkItem, className)}
            id={id}
            to={to}
            target={target}
            rel={rel}
            isActive={() => isCurrentPage}
            activeClassName={activeClassName}
          >
            {children}
          </NavLink>
        ) : (
          <As
            className={classNames(classes.sidebarLinkItem, {
              [`${activeClassName}`]: isCurrentPage,
            })}
            id={id}
            onClick={onClick}
          >
            {children}
          </As>
        )}
      </>
    )
  }, [to, target, rel, className, id, activeClassName, As, isCurrentPage, onClick])

  return (
    <Wrapper>
      {title && (
        <span className={classes.sidebarLinkItemTitle}>{title}</span>
      )}
      {children}
    </Wrapper>
  )
}

export default SidebarLinksItem
