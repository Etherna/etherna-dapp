/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

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
