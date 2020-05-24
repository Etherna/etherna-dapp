import { useEffect } from "react"
import PropTypes from "prop-types"

import { useStateValue, ReducerTypes } from "./LayoutContext"

const LayoutWrapper = ({ children, hideSidebar, emptyLayout }) => {
    // eslint-disable-next-line no-unused-vars
    const [_, dispatch] = useStateValue()

    useEffect(() => {
        dispatch({
            type: ReducerTypes.SET_EMPTY_LAYOUT,
            emptyLayout
        })
        dispatch({
            type: ReducerTypes.SET_HIDE_SIDEBAR,
            hideSidebar
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return children
}

LayoutWrapper.propTypes = {
    hideSidebar: PropTypes.bool,
    emptyLayout: PropTypes.bool,
}

LayoutWrapper.defaultProps = {
    hideSidebar: false,
    emptyLayout: false,
}

export default LayoutWrapper