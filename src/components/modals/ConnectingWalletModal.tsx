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
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { closeConnectingWalletModal } from "@state/actions/modals"

const ConnectingWalletModal = ({ show = false }) => {
  return (
    <Modal show={show} showCloseButton={false}>
      <div className="modal-header">
        <h4 className="modal-title mx-auto">Signing in into Etherna</h4>
      </div>
      <p className="text-center text-gray-600 my-6">
        Approve the message in your <br /> Web3 wallet to continue
      </p>
      <div className="flex my-6">
        <Spinner className="mx-auto" width="60" />
      </div>
      <div className="flex">
        <Button className="mx-auto" action={closeConnectingWalletModal} aspect="secondary">
          Close
        </Button>
      </div>
    </Modal>
  )
}

export default ConnectingWalletModal
