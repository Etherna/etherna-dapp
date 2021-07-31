import React from "react"
import classNames from "classnames"

import "./field-description.scss"

type FieldDesrcriptionProps = {
  smaller?: boolean
}

const FieldDesrcription: React.FC<FieldDesrcriptionProps> = ({ children, smaller }) => {
  return (
    <p className={classNames("field-description", { smaller })}>
      {children}
    </p>
  )
}

export default FieldDesrcription
