import React from "react"

import "./form-group.scss"

const FormGroup: React.FC = ({ children }) => {
  return (
    <div className="form-group">
      {children}
    </div>
  )
}

export default FormGroup
