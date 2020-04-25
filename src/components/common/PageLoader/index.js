import React from "react"
import NProgress from "nprogress"

import "./page-loader.scss"

class PageLoader extends React.Component {
    UNSAFE_componentWillMount() {
        NProgress.configure({
            showSpinner: false
        })
        NProgress.start()
    }

    componentWillUnmount() {
        NProgress.done()
    }

    render() {
        return ""
    }
}

export default PageLoader