import React from "react"
import { useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"

import "./header.scss"
import UserMenu from "@components/user/UserMenu"
import * as Routes from "@routes"

const ChannelsMatches = [/^\/channel\//, /^\/channels/]
const ExploreMatches = [/^\/watch/]

const anyMatch = (patterns, string) => {
    return patterns.filter(p => string.match(p)).length > 0
}

const Header = () => {
    const location = useLocation()
    const { existsOnIndex } = useSelector(state => state.profile)
    return (
        <header className="header">
            <nav className="navbar">
                <div className="left-nav">
                    <Link
                        to={Routes.getHomeLink()}
                        className={
                            "nav-item" +
                            (location.pathname === "/" ||
                            anyMatch(
                                ExploreMatches,
                                location.pathname
                            )
                                ? " active"
                                : "")
                        }
                    >
                        Explore
                    </Link>
                    <Link
                        to={Routes.getChannelsLink()}
                        className={
                            "nav-item" +
                            (anyMatch(
                                ChannelsMatches,
                                location.pathname
                            )
                                ? " active"
                                : "")
                        }
                    >
                        Channels
                    </Link>
                    {/* <Link
                        to={Routes.getHowItWorksLink()}
                        className="nav-item"
                        activeClassName="active"
                    >
                        How it works
                    </Link> */}
                </div>
                <div className="logo">
                    <Link to={Routes.getHomeLink()}>
                        <img
                            src={require("@svg/logo.svg")}
                            alt=""
                            width={140}
                        />
                    </Link>
                </div>
                <div className="right-nav">
                    {existsOnIndex && (
                        <Link
                            to={Routes.getVideoUploadLink()}
                            className="nav-item"
                            activeClassName="active"
                        >
                            <img
                                src={require("@svg/icons/upload-icon.svg")}
                                alt=""
                            />
                            <span>Upload</span>
                        </Link>
                    )}
                    <UserMenu />
                </div>
            </nav>
        </header>
    )
}

export default React.memo(Header)
