import React from "react"
import PropTypes from "prop-types"

import Modal from "../common/Modal"
import Button from "../common/Button"
import provider from "@state/actions/provider"
import { closeSwitchedAddressModal } from "@state/actions/modals"

const SwitchedAddressModal = ({ address, prevAddress }) => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">Address change detected</h4>
            </div>
            <p className="text-center my-6">
                Signin address is {prevAddress} <br/>
                Your current address is {address}
            </p>
            <div className="flex flex-col">
                <Button className="mx-auto" action={provider.switchAccount}>
                    Sign in with new address
                </Button>
                <Button className="mx-auto mt-3" aspect="secondary" action={closeSwitchedAddressModal}>
                    Close
                </Button>
            </div>
        </Modal>
    )
}

SwitchedAddressModal.propTypes = {
    prevAddress: PropTypes.string,
}

export default SwitchedAddressModal
