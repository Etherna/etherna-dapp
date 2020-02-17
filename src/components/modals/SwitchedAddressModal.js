import React from "react"
import PropTypes from "prop-types"

import Modal from "../common/Modal"
import Button from "../common/Button"
import actions from "../../state/actions/login"
const { handleSignOut } = actions

const SwitchedAddressModal = ({ prevAddress }) => {
    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header text-center">
                <h4>Address change detected</h4>
            </div>
            <p className="text-center my-6">
                Revert to the previous address {prevAddress} in your Web3 wallet or sign back in with the new address.
            </p>
            <div className="flex">
                <Button className="mx-auto" action={handleSignOut}>Sign in with new address</Button>
            </div>
        </Modal>
    )
}

SwitchedAddressModal.propTypes = {
    prevAddress: PropTypes.string,
}

export default SwitchedAddressModal