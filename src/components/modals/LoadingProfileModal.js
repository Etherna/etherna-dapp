import React from "react"

import Modal from "../common/Modal"

const LoadingProfileModal = () => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">Loading profile</h4>
            </div>
            <div className="flex my-6">
                <img
                    src={require("svg/animated/spinner.svg")}
                    className="mx-auto"
                    width="60"
                    alt=""
                />
            </div>
        </Modal>
    )
}

export default LoadingProfileModal
