import React from "react"
import classnames from "classnames"

type NavPillsItemProps = {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

const NavPillsItem = ({ children, active, onClick }: NavPillsItemProps) => {
  return (
    <div
      className={classnames("nav-pill", {
        active,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default NavPillsItem
