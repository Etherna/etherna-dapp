import React from "react"

import { ReactComponent as ErrorIcon } from "@svg/icons/error.svg"

import Modal from "@common/Modal"
import Button from "@common/Button"
import { closeUnsupportedBrowserModal } from "@state/actions/modals"

const UnsupportedBrowserModal = ({ show = false }) => {
  return (
    <Modal
      show={show}
      showCloseButton={true}
      showCancelButton={false}
      status="warning"
      title={"You must use Safari version 11.1 or higher"}
      icon={<ErrorIcon />}
      footerButtons={
        <Button aspect="secondary" action={closeUnsupportedBrowserModal}>
          Close
        </Button>
      }
    >
      In alternative you can use Chrome or Brave browsers.
    </Modal>
  )
}

export default UnsupportedBrowserModal
