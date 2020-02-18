import React from "react"

import Modal from "../common/Modal"

const LoadingChannelModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header text-center">
                <h4>Loading channel</h4>
            </div>
        </Modal>
    )
}

export default LoadingChannelModal