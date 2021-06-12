import React from "react"

import "./tabbar.scss"

const Tabbar: React.FC = ({ children }) => {
  return (
    <nav className="tabbar">
      {children}
    </nav>
  )
}

export default Tabbar
