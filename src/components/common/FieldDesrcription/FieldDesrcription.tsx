import React from "react"

import "./field-description.scss"

const FieldDesrcription: React.FC = ({ children }) => {
  return (
    <p className="field-description">
      {children}
    </p>
  )
}

export default FieldDesrcription
