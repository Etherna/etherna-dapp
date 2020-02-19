import React from "react"
import { Location } from "@reach/router"
import { Link } from "gatsby"

import "./header.scss"
import Image from "../../common/Image"
import UserMenu from "../../user/UserMenu"
import * as Routes from "../../../routes"

const ChannelMatches = [/^\/channel\//, /^\/channels/]
const ExploreMatches = [/^\/watch/]

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
                                    to={Routes.getHowItWorksLink()}
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
