/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React, { useEffect } from "react"
import PropTypes from "prop-types"

import "./layout.scss"
import Header from "components/layout/Header"
import Sidebar from "components/layout/Sidebar"
import Modals from "components/modals/ModalsSection"
import { providerActions } from "state/actions"
import { useSelector } from "react-redux"

const Layout = ({ children, showSidebar }) => {
    const { isSignedIn } = useSelector(state => state.user)

    useEffect(() => {
        autoLogin()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const autoLogin = () => {
        if (typeof window === "undefined") return
        if (!isSignedIn && window.localStorage.getItem("defaultWallet")) {
            // auto login
            providerActions.signin()
        }
    }

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
