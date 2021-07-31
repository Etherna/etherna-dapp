import React from "react"

import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { ReactComponent as SignatureIcon } from "@svg/icons/signature-required.svg"

import Modal from "../common/Modal"
import Button from "../common/Button"
import { closeConnectingWalletModal } from "@state/actions/modals"

const ConnectingWalletModal = ({ show = false }) => {
  return (
    <Modal
      show={show}
      showCloseButton={false}
      showCancelButton={false}
      title="Connecting wallet"
      icon={<SignatureIcon />}
      footerButtons={
        <Button aspect="secondary" action={closeConnectingWalletModal}>
          Close
        </Button>
      }
    >
      <p>
        Approve the message in your Web3 wallet to continue
      </p>
      <Spinner width="30" />
    </Modal>
  )
}

export default ConnectingWalletModal
