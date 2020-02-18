import React from "react"

import Modal from "../common/Modal"
import Button from "../common/Button"
import Image from "../common/Image"
import { closeConsentModal } from "../../state/actions/modals"

const ProvideConsentModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">Provide Consent</h4>
            </div>
            <p className="text-center text-gray-600 my-6">
                Approve the message in your <br /> Web3 wallet to continue
            </p>
            <div className="flex my-6">
                <Image className="mx-auto" filename="spinner.svg" maxWidth="60" />
            </div>
            <div className="flex">
                <Button className="mx-auto" action={closeConsentModal}>Close</Button>
            </div>
        </Modal>
    )
}

export default ProvideConsentModal