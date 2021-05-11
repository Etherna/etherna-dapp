import React from "react"

import "./dropdown.scss"

import { DropDownContextProvider } from "./DropDownContext"
import DropDownBackdrop from "./DropDownBackdrop"

type DropDownProps = {
  children: React.ReactNode
}

const DropDown = ({ children }: DropDownProps) => {
  return (
    <DropDownContextProvider>
      <div className="dropdown">{children}</div>
      <DropDownBackdrop />
    </DropDownContextProvider>
  )
}

export default DropDown
