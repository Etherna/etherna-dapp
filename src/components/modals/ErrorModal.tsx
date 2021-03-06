/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

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
  const isMozillaError = error.substring(0, 26) === "value/</<@moz-extension://"
  const errorString = error.substring(0, 200)

  return (
    <Modal show={show} showCloseButton={false}>
      <div className="flex justify-center text-orange-500 mb-3">
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
