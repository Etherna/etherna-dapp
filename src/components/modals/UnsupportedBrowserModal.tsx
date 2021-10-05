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

import { ReactComponent as ErrorIcon } from "@assets/icons/error.svg"

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
        <Button modifier="secondary" onClick={closeUnsupportedBrowserModal}>
          Close
        </Button>
      }
    >
      In alternative you can use Chrome or Brave browsers.
    </Modal>
  )
}

export default UnsupportedBrowserModal
