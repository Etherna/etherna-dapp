/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"

import "./layout.scss"
import Header from "@components/layout/Header"
import Sidebar from "@components/layout/Sidebar"
import Modals from "@components/modals/ModalsSection"

const Layout = ({ children, showSidebar }) => {
    return (
        <>
            <Header />
            {showSidebar && <Sidebar />}
            <main>{children}</main>
            <Modals />
        </>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
    showSidebar: PropTypes.bool,
}

Layout.defaultProps = {
    showSidebar: true,
}

export default Layout
