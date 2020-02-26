import React from "react"
import PropTypes from "prop-types"

import Modal from "../common/Modal"
import Image from "../common/Image"
import Button from "../common/Button"
import { closeErrorModal } from "@state/actions/modals"

const ErrorModal = ({ title, error }) => {
    let isMetaMaskSignError
    //let isMetaMaskFromError
    let isMozillaError
    let errorString

    if (error) {
        isMetaMaskSignError =
            error.substring(0, 65) ===
            "Web3 Wallet Signature Error: User denied message signature."
        //isMetaMaskFromError = error.substring(0, 58) === 'Web3 Wallet Signature Error: from field is required.'
        isMozillaError =
            error.substring(0, 26) === "value/</<@moz-extension://"
        errorString = error.substring(0, 200)
    }

    errorString = errorString || "There was an error logging in."

    return (
        <Modal show={true} showCloseButton={false}>
            <div className="table mx-auto mb-3">
                {(isMetaMaskSignError || isMozillaError) ? (
                    <Image
                        filename="signature-required-icon.svg"
                        alt="Wallet signature required"
                    />
                ) : (
                    <Image
                        filename="error-icon.svg"
                        alt="Error"
                        width={40}
                    />
                )}
            </div>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">
                    {(isMetaMaskSignError || isMozillaError) ? (
                        <span>Sign in</span>
                    ) : (
                        <span>{title}</span>
                    )}
                </h4>
            </div>

            <div className="text-center my-6">
                {isMetaMaskSignError || isMozillaError ? (
                    <p>
                        You must provide consent to 3Box in your Web3 wallet to
                        sign in or create a profile, please try again.
                    </p>
                ) : (
                    <>
                        <p>{errorString}</p>
                    </>
                )}
            </div>

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
