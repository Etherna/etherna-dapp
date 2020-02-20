import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import actions from "../../state/actions"

const { openBox, injectWeb3 } = actions.login
const { checkMobileWeb3, checkNetwork } = actions.enviroment

const LoginButton = ({
    children,
    checkMobileWeb3,
    injectWeb3,
    checkNetwork,
    openBox,
}) => {
    const login = async () => {
        try {
            await checkMobileWeb3()
            await injectWeb3(null, true, false, false)
            await checkNetwork()
            await openBox()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <button
            className="btn btn-outline"
            type="button"
            onClick={() => login()}
        >
            {children}
        </button>
    )
}

LoginButton.propTypes = {
    openBox: PropTypes.func.isRequired,
    injectWeb3: PropTypes.func.isRequired,
    checkMobileWeb3: PropTypes.func.isRequired,
    checkNetwork: PropTypes.func.isRequired,
}

const mapState = state => ({})

export default connect(mapState, {
    openBox,
    injectWeb3,
    checkMobileWeb3,
    checkNetwork,
})(LoginButton)
