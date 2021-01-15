import React from "react"
import classnames from "classnames"

import "./nav-pills.scss"

type NavPillsProps = {
  children: React.ReactNode
  className?: string
  vertical?: boolean
}

const NavPills = ({ children, className, vertical }: NavPillsProps) => {
  return (
    <nav
      className={classnames("nav-pills", className, {
        "nav-vertical": vertical,
      })}
    >
      {children}
    </nav>
  )
}

export default NavPills
