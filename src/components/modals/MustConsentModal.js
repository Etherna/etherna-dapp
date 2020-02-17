import React from "react"

import Modal from "../common/Modal"
import Button from "../common/Button"
import { closeErrorModal } from "../../state/actions/modals"

const MustConsentModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header text-center">
                <h4>Sign in</h4>
            </div>
            <p className="text-center my-6">
                You must provide consent to 3Box in your Web3 wallet to sign in or create a channel, please try again.
            </p>
            <div className="flex">
                <Button className="mx-auto" action={closeErrorModal}>Close</Button>
            </div>
        </Modal>
    )
}

export default MustConsentModal