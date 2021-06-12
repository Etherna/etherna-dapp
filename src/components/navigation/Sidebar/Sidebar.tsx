import React from "react"

import "./sidebar.scss"

const Sidebar: React.FC = ({ children }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        {children}
      </div>
    </aside>
  )
}

export default Sidebar
