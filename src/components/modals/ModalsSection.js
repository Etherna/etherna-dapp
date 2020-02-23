import React from "react"
import { useSelector } from "react-redux"

import ConnectingWalletModal from "./ConnectingWalletModal"
import UnsupportedBrowserModal from "./UnsupportedBrowserModal"
import MustConsentModal from "./MustConsentModal"
import ErrorModal from "./ErrorModal"
import SwitchedAddressModal from "./SwitchedAddressModal"
import LoadingProfileModal from "./LoadingProfileModal"

const ModalsSection = () => {
    const {
        errorMessage,
        errorTitle,
        isConnectingWallet,
        isLoadingProfile,
        showUnsupportedModal,
        showAccountSwitchModal,
        //showNetwokChangeModal,
    } = useSelector(state => state.ui)
    const { address } = useSelector(state => state.user)
    const { currentAddress } = useSelector(state => state.env)

    const mustConsentError =
        errorMessage &&
        errorMessage.substring(0, 65) === "Error: Web3 Wallet Message Signature: User denied message signature."

    return (
        <section>
            {isConnectingWallet && <ConnectingWalletModal />}

            {showUnsupportedModal && <UnsupportedBrowserModal />}

            {!!mustConsentError && <MustConsentModal />}

            {errorMessage && !mustConsentError && (
                <ErrorModal title={errorTitle} error={errorMessage} />
            )}

            {showAccountSwitchModal && (
                <SwitchedAddressModal address={currentAddress} prevAddress={address} />
            )}

            {isLoadingProfile && (
                <LoadingProfileModal />
            )}
        </section>
    )
}

export default ModalsSection
