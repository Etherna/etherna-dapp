import React from "react"
import classNames from "classnames"

import "./container.scss"

type ContainerProps = {
  className?: string
  fluid?: boolean
  noPaddingX?: boolean
  noPaddingY?: boolean
}

const Container: React.FC<ContainerProps> = ({ children, className, fluid, noPaddingX, noPaddingY }) => {
  return (
    <div className={classNames(className, {
      "container": !fluid,
      "container-fluid": fluid,
      "no-x-padding": noPaddingX,
      "no-y-padding": noPaddingY
    })}>
      {children}
    </div>
  )
}

export default Container
