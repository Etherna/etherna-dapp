import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import "./layout.scss"
import Header from "@components/layout/Header"
import Sidebar from "@components/layout/Sidebar"
import Modals from "@components/modals/ModalsSection"
import { providerActions } from "@state/actions"

const Layout = ({ children }) => {
    const location = useLocation()
    const { isSignedIn } = useSelector(state => state.user)

    const hideSidebar =
        location.pathname === "/watch" || location.pathname === "/how-it-works"

    useEffect(() => {
        autoSignIn()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const autoSignIn = () => {
        if (typeof window === "undefined") return
        if (!isSignedIn && window.localStorage.getItem("signedIn")) {
            // auto login
            providerActions.signin()
        }
    }

    return (
        <>
            <Header />
            {!hideSidebar && <Sidebar />}
            <main>{children}</main>
            <Modals />
        </>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default Layout
