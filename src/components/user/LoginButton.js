import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import actions from "../../state/actions"

const { openBox, injectWeb3 } = actions.login

class LoginButton extends React.Component {
    handleSignInUp = async (chooseWallet, shouldSignOut, e, fromPost) => {
        try {
            if (e) e.stopPropagation()
            //await this.props.checkMobileWeb3()
            await this.props.injectWeb3(
                null,
                chooseWallet,
                false,
                shouldSignOut
            )
            //await this.props.checkNetwork()
            await this.props.openBox(true, fromPost)
        } catch (err) {
            console.error(err)
        }
    }

    render() {
        return (
            <button
                className="btn btn-outline"
                type="button"
                onClick={() => this.handleSignInUp(true)}
            >
                {this.props.children}
            </button>
        )
    }
}

LoginButton.propTypes = {
    openBox: PropTypes.func.isRequired,
    injectWeb3: PropTypes.func.isRequired,
}

const mapState = state => ({})

export default connect(mapState, {
    openBox,
    injectWeb3,
    //checkMobileWeb3,
    //checkNetwork,
})(LoginButton)
