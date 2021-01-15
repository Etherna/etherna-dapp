import React from "react"
import { NavLink } from "react-router-dom"

import "./header.scss"

import { ReactComponent as Logo } from "@svg/logo.svg"
import { ReactComponent as UploadIcon } from "@svg/icons/upload-icon.svg"

import UserMenu from "@components/user/UserMenu"
import UserCredit from "@components/user/UserCredit"
import useSelector from "@state/useSelector"
import Routes from "@routes"

const ProfilesMatches = [/^\/profile\//, /^\/profiles/]
const ExploreMatches = [/^\/watch/]

const anyMatch = (patterns: RegExp[], string: string) => {
  return patterns.filter(p => string.match(p)).length > 0
}

const Header = () => {
  const { isSignedIn } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)

  return (
    <header className="header">
      <nav className="navbar">
        <div className="left-nav">
          <NavLink
            to={Routes.getHomeLink()}
            className="nav-item"
            activeClassName="active"
            isActive={(_, location) => {
              if (location.pathname === "/" || anyMatch(ExploreMatches, location.pathname)) {
                return true
              }
              return false
            }}
          >
            Explore
          </NavLink>
          <NavLink
            to={Routes.getProfilesLink()}
            className="nav-item"
            activeClassName="active"
            isActive={(_, location) => {
              if (anyMatch(ProfilesMatches, location.pathname)) {
                return true
              }
              return false
            }}
          >
            Profiles
          </NavLink>
        </div>
        <div className="logo">
          <NavLink to={Routes.getHomeLink()}>
            <Logo />
          </NavLink>
        </div>
        <div className="right-nav">
          {isSignedIn === true && !isLoadingProfile && (
            <>
              <NavLink to={Routes.getVideoUploadLink()} className="nav-item nav-item-hidden-mobile" activeClassName="active">
                <UploadIcon />
                <span>Upload</span>
              </NavLink>

              <UserCredit />
            </>
          )}
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}

export default React.memo(Header)
