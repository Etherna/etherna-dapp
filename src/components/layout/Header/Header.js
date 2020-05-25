import React from "react"
import { useSelector } from "react-redux"
import { NavLink } from "react-router-dom"

import "./header.scss"
import UserMenu from "@components/user/UserMenu"
import Routes from "@routes"
import Logo from "@icons/Logo"
import UploadIcon from "@icons/menu/UploadIcon"

const ChannelsMatches = [/^\/channel\//, /^\/channels/]
const ExploreMatches = [/^\/watch/]

const anyMatch = (patterns, string) => {
    return patterns.filter(p => string.match(p)).length > 0
}

const Header = () => {
    const { existsOnIndex } = useSelector(state => state.profile)

    return (
        <header className="header">
            <nav className="navbar">
                <div className="left-nav">
                    <NavLink
                        to={Routes.getHomeLink()}
                        className="nav-item"
                        activeClassName="active"
                        isActive={(_, location) => {
                            if (
                                location.pathname === "/" ||
                                anyMatch(ExploreMatches, location.pathname)
                            ) {
                                return true
                            }
                            return false
                        }}
                    >
                        Explore
                    </NavLink>
                    <NavLink
                        to={Routes.getChannelsLink()}
                        className="nav-item"
                        activeClassName="active"
                        isActive={(_, location) => {
                            if (anyMatch(ChannelsMatches, location.pathname)) {
                                return true
                            }
                            return false
                        }}
                    >
                        Channels
                    </NavLink>
                    {/* <NavLink
                        to={Routes.getHowItWorksLink()}
                        className="nav-item"
                        activeClassName="active"
                    >
                        How it works
                    </NavLink> */}
                </div>
                <div className="logo">
                    <NavLink to={Routes.getHomeLink()}>
                        <Logo />
                    </NavLink>
                </div>
                <div className="right-nav">
                    {existsOnIndex && (
                        <NavLink
                            to={Routes.getVideoUploadLink()}
                            className="nav-item"
                            activeClassName="active"
                        >
                            <UploadIcon />
                            <span>Upload</span>
                        </NavLink>
                    )}
                    <UserMenu />
                </div>
            </nav>
        </header>
    )
}

export default React.memo(Header)
