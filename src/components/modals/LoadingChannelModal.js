import React from "react"

import Modal from "../common/Modal"
import Image from "../common/Image"

const LoadingChannelModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header text-center">
                <h4>Loading channel</h4>
            </div>
            <div className="flex my-6">
                <Image filename="" className="mx-auto" />
            </div>
        </Modal>
    )
}

export default LoadingChannelModal