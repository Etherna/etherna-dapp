import React from "react"
import PropTypes from "prop-types"

import Modal from "../common/Modal"
import Image from "../common/Image"
import Button from "../common/Button"
import { closeErrorModal } from "../../state/actions/modals"

const ErrorModal = ({ error }) => {
    let isMetaMaskSignError
    let isMetaMaskFromError
    let isMozillaError
    let errorString

    const errorMsg = error.message
    if (errorMsg) {
        isMetaMaskSignError =
            errorMsg.substring(0, 65) ===
            "Web3 Wallet Signature Error: User denied message signature."
        //isMetaMaskFromError = errorMsg.substring(0, 58) === 'Web3 Wallet Signature Error: from field is required.'
        isMozillaError =
            errorMsg.substring(0, 26) === "value/</<@moz-extension://"
        errorString = errorMsg.substring(0, 200)
    }

    errorString = errorString || "There was an error logging in."

    return (
        <Modal show={true} showCloseButton={false}>
            {isMetaMaskSignError || isMozillaError ? (
                <Image
                    filename="signature-required-icon.svg"
                    alt="Wallet signature required"
                />
            ) : (
                <Image filename="error-icon.svg" alt="Error" />
            )}

            <div className="modal-header text-center">
                <h4>
                    {isMetaMaskSignError || isMozillaError ? (
                        <h3>Log in</h3>
                    ) : (
                        <h3>Error</h3>
                    )}
                </h4>
            </div>

            <p className="text-center my-6">
                {isMetaMaskSignError || isMozillaError ? (
                    <p>
                        You must provide consent to 3Box in your Web3 wallet to
                        sign in or create a profile, please try again.
                    </p>
                ) : (
                    <>
                        <p>{errorString}</p>
                        <br />
                        <p>Please refresh the page and try again.</p>
                    </>
                )}
            </p>

            <div className="flex">
                <Button className="mx-auto" action={closeErrorModal}>
                    Close
                </Button>
            </div>
        </Modal>
    )
}

ErrorModal.propTypes = {
    error: PropTypes.string,
}

ErrorModal.defaultProps = {
    error: "",
}

export default ErrorModal
