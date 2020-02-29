import React from "react"

import "./sidebar.scss"
import MyProfile from "./MyProfile"
import ReccomendedProfiles from "./ReccomendedProfiles"

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidenav">
                <MyProfile />
                <ReccomendedProfiles />
            </div>
            <small className="footer-notice">
                Copyright © {new Date().getFullYear()} etherna.io.
            </small>
        </aside>
    )
}

export default React.memo(Sidebar)
