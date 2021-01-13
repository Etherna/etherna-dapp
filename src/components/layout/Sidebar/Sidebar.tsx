import React from "react"
import { Link } from "react-router-dom"

import "./sidebar.scss"

import MyProfile from "./MyProfile"
import NewProfiles from "./NewProfiles"
import FeedbackButton from "./FeedbackButton"
import Routes from "@routes"

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidenav">
        <MyProfile />
        <NewProfiles />
      </div>
      <small className="footer-notice">
        <nav className="footer-menu">
          <Link to={Routes.getHowItWorksLink()} className="footer-link">
            How it works
          </Link>
          <FeedbackButton />
          <a
            href="https://index.etherna.io/swagger"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Index Api
          </a>
        </nav>
        Copyright © {new Date().getFullYear()} Etherna Sagl.
      </small>
    </aside>
  )
}

export default React.memo(Sidebar)
