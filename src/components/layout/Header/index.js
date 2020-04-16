import React from "react"
import { useSelector } from "react-redux"
import { NavLink } from "react-router-dom"

import "./header.scss"
import UserMenu from "@components/user/UserMenu"
import * as Routes from "@routes"

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
                                anyMatch(
                                    ExploreMatches,
                                    location.pathname
                                )
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
                            if (
                                anyMatch(
                                    ChannelsMatches,
                                    location.pathname
                                )
                            ) {
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
                        <img
                            src={require("@svg/logo.svg")}
                            alt=""
                            width={140}
                        />
                    </NavLink>
                </div>
                <div className="right-nav">
                    {existsOnIndex && (
                        <NavLink
                            to={Routes.getVideoUploadLink()}
                            className="nav-item"
                            activeClassName="active"
                        >
                            <img
                                src={require("@svg/icons/upload-icon.svg")}
                                alt=""
                            />
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
