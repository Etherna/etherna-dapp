import React from "react"

import ConnectingWalletModal from "./ConnectingWalletModal"
import UnsupportedBrowserModal from "./UnsupportedBrowserModal"
import ErrorModal from "./ErrorModal"
import ShortcutModal from "./ShortcutModal"
import ImageCropModal from "./ImageCropModal"
import useSelector from "@state/useSelector"

const ModalsSection = () => {
    const {
        errorMessage,
        errorTitle,
        isConnectingWallet,
        showUnsupportedModal,
        //showNetwokChangeModal,
        isEditingShortcut,
        isCroppingImage
    } = useSelector(state => state.ui)
    const mustConsentError =
        errorMessage &&
        errorMessage.substring(0, 65) ===
            "Error: Web3 Wallet Message Signature: User denied message signature."

    return (
        <section>
            {isConnectingWallet && <ConnectingWalletModal />}

            {showUnsupportedModal && <UnsupportedBrowserModal />}

            {errorMessage && !mustConsentError && (
                <ErrorModal title={errorTitle} error={errorMessage} />
            )}

            {isEditingShortcut && <ShortcutModal />}

            {isCroppingImage && <ImageCropModal />}
        </section>
    )
}

export default ModalsSection
