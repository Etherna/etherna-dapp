import React from "react"

import Modal from "../common/Modal"
import Button from "../common/Button"
import { closeUnsupportedBrowserModal } from "../../state/actions/modals"

const UnsupportedBrowserModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">You must use Safari version 11.1 or higher</h4>
            </div>
            <p className="text-center my-6">
                In alternative you can use Chrome or Brave browsers.
            </p>
            <div className="flex">
                <Button
                    className="mx-auto"
                    action={closeUnsupportedBrowserModal}
                >
                    Close
                </Button>
            </div>
        </Modal>
    )
}

export default UnsupportedBrowserModal
