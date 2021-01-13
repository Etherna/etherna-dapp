import React from "react"

import Modal from "../common/Modal"
import Button from "../common/Button"
import { ReactComponent as SignatureIcon } from "@svg/icons/signature-required-icon.svg"
import { ReactComponent as ErrorIcon } from "@svg/icons/error-icon.svg"
import { closeErrorModal } from "@state/actions/modals"

type ErrorModalProps = {
  title?: string
  error: string
  show?: boolean
}

const ErrorModal = ({ title, error = "", show = false }: ErrorModalProps) => {
  const isMetaMaskSignError = error.substring(0, 65) === "Web3 Wallet Signature Error: User denied message signature."
  //const isMetaMaskFromError = error.substring(0, 58) === 'Web3 Wallet Signature Error: from field is required.'
  const isMozillaError = error.substring(0, 26) === "value/</<@moz-extension://"
  const errorString = error.substring(0, 200)

  return (
    <Modal show={show} showCloseButton={false}>
      <div className="table mx-auto mb-3">
        {isMetaMaskSignError || isMozillaError ? (
          <SignatureIcon />
        ) : (
          <ErrorIcon width={40} />
        )}
      </div>
      <div className="modal-header">
        <h4 className="modal-title mx-auto">
          {isMetaMaskSignError || isMozillaError ? <span>Sign in</span> : <span>{title}</span>}
        </h4>
      </div>

      <div className="text-center my-6">
        {isMetaMaskSignError || isMozillaError ? (
          <p>
            You must provide consent in your Web3 wallet to sign in or create a profile, please try
            again.
          </p>
        ) : (
          <>
            <p>{errorString}</p>
          </>
        )}
      </div>

      <div className="flex">
        <Button className="mx-auto" action={closeErrorModal}>
          Close
        </Button>
      </div>
    </Modal>
  )
}

export default ErrorModal
