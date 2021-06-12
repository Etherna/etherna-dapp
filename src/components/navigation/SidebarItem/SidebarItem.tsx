import React, { ElementType, useMemo } from "react"
import { NavLink, useLocation } from "react-router-dom"
import classnames from "classnames"

import "./sidebar-item.scss"

type SidebarItemProps = {
  as?: ElementType
  title?: string
  to?: string
  target?: "_blank"
  rel?: "noreferrer" | "noopener" | "nofollow"
  iconSvg?: React.ReactNode
  activeClassName?: string
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
            className={classnames("sidebar-item")}
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
            className={classnames("sidebar-item", { [`${activeClassName}`]: isCurrentPage })}
            onClick={onClick}
          >
            {children}
          </As>
        )}
      </>
    )
  }, [to, target, rel, activeClassName, isCurrentPage, onClick])

  return (
    <Wrapper>
      {iconSvg && (
        <div className="sidebar-item-icon">
          {iconSvg}
        </div>
      )}
      {title && (
        <span className="sidebar-item-title">{title}</span>
      )}
      {children}
    </Wrapper>
  )
}

export default SidebarItem
