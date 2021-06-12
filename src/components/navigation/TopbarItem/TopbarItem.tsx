import React, { useMemo } from "react"
import { NavLink, useLocation } from "react-router-dom"
import classnames from "classnames"

import "./topbar-item.scss"

type TopbarItemProps = {
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
