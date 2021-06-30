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
