import React from "react"

import { ReactComponent as SignatureIcon } from "@svg/icons/signature-required.svg"
import { ReactComponent as ErrorIcon } from "@svg/icons/error.svg"

import Modal from "@common/Modal"
import Button from "@common/Button"
import { useErrorMessage } from "@state/hooks/ui"

type ErrorModalProps = {
  title?: string
  error: string
  show?: boolean
}

const ErrorModal = ({ title, error = "", show = false }: ErrorModalProps) => {
  const { hideError } = useErrorMessage()

  const isMetaMaskSignError = error.substring(0, 65) === "Web3 Wallet Signature Error: User denied message signature."
  const isMozillaError = error.substring(0, 26) === "value/</<@moz-extension://"
  const errorString = error.substring(0, 200)

  return (
    <Modal
      show={show}
      showCloseButton={false}
      showCancelButton={false}
      status="danger"
      title={isMetaMaskSignError || isMozillaError ? "Sign in" : title}
      icon={isMetaMaskSignError || isMozillaError ? <SignatureIcon /> : <ErrorIcon />}
      footerButtons={
        <Button aspect="secondary" action={hideError}>
          Close
        </Button>
      }
    >
      <>
        {isMetaMaskSignError || isMozillaError ? (
          <p>
            You must provide consent in your Web3 wallet to sign in or create a profile, please try
            again.
          </p>
        ) : (
          <>
            {errorString}
          </>
        )}
      </>
    </Modal>
  )
}

export default ErrorModal
