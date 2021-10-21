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
