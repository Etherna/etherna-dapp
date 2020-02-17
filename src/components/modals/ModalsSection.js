import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import ProvideConsentModal from "./ProvideConsentModal"
import UnsupportedBrowserModal from "./UnsupportedBrowserModal"
import MustConsentModal from "./MustConsentModal"
import ErrorModal from "./ErrorModal"
import SwitchedAddressModal from "./SwitchedAddressModal"

const ModalsSection = ({
    error,
    prevAddress,

    provideConsent,
    showUnsupportedBrowser,
    switchedAddressModal,
    showErrorModal
}) => {
    const mustConsentError = error && error.message && error.message.substring(0, 65) === 'Error: Web3 Wallet Message Signature: User denied message signature.'

    return (
        <section>
            {provideConsent &&
                <ProvideConsentModal />
            }

            {showUnsupportedBrowser &&
                <UnsupportedBrowserModal />
            }

            {!!mustConsentError &&
                <MustConsentModal />
            }

            {showErrorModal && !mustConsentError &&
                <ErrorModal error={error} />
            }

            {switchedAddressModal &&
                <SwitchedAddressModal
                    prevAddress={prevAddress}
                />
            }
        </section>
    )
}

ModalsSection.propTypes = {
    error: PropTypes.string,
    prevAddress: PropTypes.string,

    provideConsent: PropTypes.bool,
    showUnsupportedBrowser: PropTypes.bool,
    showErrorModal: PropTypes.bool,
    switchedAddressModal: PropTypes.bool,
}

ModalsSection.defaultProps = {
    error: "",
    prevAddress: "",

    provideConsent: false,
    showUnsupportedBrowser: false,
    showErrorModal: false,
    switchedAddressModal: false,
}

const mapState = state => {
    return {
        provideConsent: state.ui.provideConsent,
        showUnsupportedBrowser: state.ui.showUnsupportedBrowser,
        showErrorModal: state.ui.showErrorModal,
        switchedAddressModal: state.ui.switchedAddressModal,
        prevAddress: state.ui.prevAddress,
    }
}

export default connect(mapState)(ModalsSection)
