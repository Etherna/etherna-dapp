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

import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"
import { ReactComponent as SignatureIcon } from "@assets/icons/signature-required.svg"

import Modal from "@common/Modal"
import Button from "@common/Button"
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
        <Button modifier="muted" onClick={closeConnectingWalletModal}>
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
