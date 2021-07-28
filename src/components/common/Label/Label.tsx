import React from "react"

import "./label.scss"

type LabelProps = {
  htmlFor?: string
  title?: string
}

const Label: React.FC<LabelProps> = ({ children, htmlFor, title }) => {
  return (
    <label className="label" htmlFor={htmlFor} title={title}>{children}</label>
  )
}

export default Label
