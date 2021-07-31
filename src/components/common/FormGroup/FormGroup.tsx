import React from "react"
import classNames from "classnames"

import "./form-group.scss"

type FormGroupProps = {
  disabled?: boolean
}

const FormGroup: React.FC<FormGroupProps> = ({ children, disabled }) => {
  return (
    <div className={classNames("form-group", { disabled })}>
      {children}
    </div>
  )
}

export default FormGroup
