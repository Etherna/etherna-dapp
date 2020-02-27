import React from "react"

import Modal from "../common/Modal"
import Image from "../common/Image"

const LoadingProfileModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">Loading profile</h4>
            </div>
            <div className="flex my-6">
                <Image className="mx-auto" filename="spinner.svg" width="60" />
            </div>
        </Modal>
    )
}

export default LoadingProfileModal
