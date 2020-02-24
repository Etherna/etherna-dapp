import React from "react"

import Modal from "../common/Modal"
import Button from "../common/Button"
import Image from "../common/Image"
import { closeConnectingWalletModal } from "@state/actions/modals"

const ConnectingWalletModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">Signing in into Etherna</h4>
            </div>
            <p className="text-center text-gray-600 my-6">
                Approve the message in your <br /> Web3 wallet to continue
            </p>
            <div className="flex my-6">
                <Image
                    className="mx-auto"
                    filename="spinner.svg"
                    maxWidth="60"
                />
            </div>
            <div className="flex">
                <Button
                    className="mx-auto"
                    action={closeConnectingWalletModal}
                    aspect="secondary"
                >
                    Close
                </Button>
            </div>
        </Modal>
    )
}

export default ConnectingWalletModal
