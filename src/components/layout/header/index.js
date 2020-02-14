import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

import Image from '../../image'
import "./header.scss"

const Header = ({ }) => {
    return (
        <header className="header">
            <nav className="navbar">
                <div className="left-nav">
                    <Link to="/" className="nav-item" activeClassName="active">Explore</Link>
                    <Link to="/channels" className="nav-item" activeClassName="active">Channels</Link>
                    <Link to="/how-it-works" className="nav-item" activeClassName="active">How it works</Link>
                </div>
                <div className="logo">
                    <Link to="/">
                        <Image filename="logo.svg" maxWidth={140} />
                    </Link>
                </div>
                <div className="right-nav"></div>
            </nav>
        </header>
    )
}

export default Header
