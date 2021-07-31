import React from "react"
import classNames from "classnames"

import "./divider.scss"
import { ReactComponent as DividerPattern } from "@svg/backgrounds/divider.svg"

type DividerProps = {
  className?: string
  top?: boolean
  bottom?: boolean
}

const Divider: React.FC<DividerProps> = ({ children, className, top, bottom }) => {
  return (
    <div className={classNames("divider", className)} aria-hidden="true">
      {top && (
        <span className="divider-top">
          <DividerPattern />
        </span>
      )}

      {children}

      {bottom && (
        <span className="divider-bottom">
          <DividerPattern />
        </span>
      )}
    </div>
  )
}

export default Divider
