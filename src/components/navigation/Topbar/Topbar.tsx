import React from "react"

import "./topbar.scss"

const Topbar: React.FC = ({ children }) => {
  return (
    <nav className="topbar">
      {children}
    </nav>
  )
}

export default Topbar
