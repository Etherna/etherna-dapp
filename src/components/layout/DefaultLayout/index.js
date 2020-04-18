import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"

import "./layout.scss"
import Header from "@components/layout/Header"
import Sidebar from "@components/layout/Sidebar"
import Modals from "@components/modals/ModalsSection"
import { providerActions } from "@state/actions"

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
