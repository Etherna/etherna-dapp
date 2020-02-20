/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

import Header from "../Header"
import Sidebar from "../Sidebar"
import Modals from "../../modals/ModalsSection"
import "./layout.scss"

const Layout = ({ children, showSidebar }) => {
    const data = useStaticQuery(graphql`
        query SiteTitleQuery {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)

    return (
        <>
            <Header siteTitle={data.site.siteMetadata.title} />
            {showSidebar &&
                <Sidebar />
            }
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
    showSidebar: true
}

export default Layout
