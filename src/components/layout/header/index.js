import React from "react"
import { Location } from "@reach/router"
import { Link } from "gatsby"

import Image from "../../image"
import UserMenu from "../../user/user-menu"
import "./header.scss"

const ChannelMatches = [/^\/channel\//, /^\/channels/]
const ExplorelMatches = [/^\/watch\//]

const anyMatch = (patterns, string) => {
    return patterns.filter(p => string.match(p)).length > 0
}

const Header = props => {
    return (
        <header className="header">
            <nav className="navbar">
                <div className="left-nav">
                    <Location>
                        {({ location }) => (
                            <>
                                <Link
                                    to="/"
                                    className={
                                        "nav-item" +
                                        (location.pathname === "/" ||
                                        anyMatch(
                                            ExplorelMatches,
                                            location.pathname
                                        )
                                            ? " active"
                                            : "")
                                    }
                                >
                                    Explore
                                </Link>
                                <Link
                                    to="/channels"
                                    className={
                                        "nav-item" +
                                        (anyMatch(
                                            ChannelMatches,
                                            location.pathname
                                        )
                                            ? " active"
                                            : "")
                                    }
                                >
                                    Channels
                                </Link>
                                <Link
                                    to="/how-it-works"
                                    className="nav-item"
                                    activeClassName="active"
                                >
                                    How it works
                                </Link>
                            </>
                        )}
                    </Location>
                </div>
                <div className="logo">
                    <Link to="/">
                        <Image filename="logo.svg" maxWidth={140} />
                    </Link>
                </div>
                <div className="right-nav">
                    <UserMenu />
                </div>
            </nav>
        </header>
    )
}

export default Header
