import React from "react"
import { useSelector } from "react-redux"

import ConnectingWalletModal from "./ConnectingWalletModal"
import UnsupportedBrowserModal from "./UnsupportedBrowserModal"
import MustConsentModal from "./MustConsentModal"
import ErrorModal from "./ErrorModal"
import LoadingProfileModal from "./LoadingProfileModal"
import ShortcutModal from "./ShortcutModal"

const ModalsSection = () => {
    const {
        errorMessage,
        errorTitle,
        isConnectingWallet,
        isLoadingProfile,
        showUnsupportedModal,
        //showNetwokChangeModal,
        isEditingShortcut,
    } = useSelector(state => state.ui)
    const mustConsentError =
        errorMessage &&
        errorMessage.substring(0, 65) ===
            "Error: Web3 Wallet Message Signature: User denied message signature."

    return (
        <section>
            {isConnectingWallet && <ConnectingWalletModal />}

            {showUnsupportedModal && <UnsupportedBrowserModal />}

            {!!mustConsentError && <MustConsentModal />}

            {errorMessage && !mustConsentError && (
                <ErrorModal title={errorTitle} error={errorMessage} />
            )}

            {isLoadingProfile && <LoadingProfileModal />}

            {isEditingShortcut && <ShortcutModal />}
        </section>
    )
}

export default ModalsSection
