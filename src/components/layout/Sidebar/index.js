import React from "react"

import "./sidebar.scss"
import MyChannel from "./MyChannel"
import ReccomendedChannels from "./ReccomendedChannels"

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidenav">
                <MyChannel />
                <ReccomendedChannels />
            </div>
            <small className="footer-notice">
                Copyright © {new Date().getFullYear()} etherna.io.
            </small>
        </aside>
    )
}

export default React.memo(Sidebar)
