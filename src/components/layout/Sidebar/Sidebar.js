import React from "react"
import { Link } from "react-router-dom"

import "./sidebar.scss"
import MyChannel from "./MyChannel"
import NewChannels from "./NewChannels"
import Routes from "@routes"

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidenav">
                <MyChannel />
                <NewChannels />
            </div>
            <small className="footer-notice">
                <nav className="footer-menu">
                    <Link to={Routes.getHowItWorksLink()} className="footer-link">
                        How it works
                    </Link>
                    <button id="jira_feedback_btn" className="footer-link">
                        Feedback
                    </button>
                    <a href="https://index.etherna.io/swagger" className="footer-link" target="_blank" rel="noopener noreferrer">
                        Index Api
                    </a>
                </nav>
                Copyright © {new Date().getFullYear()} Etherna Sagl.
            </small>
        </aside>
    )
}

export default React.memo(Sidebar)
