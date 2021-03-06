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

import Modal from "@common/Modal"
import Button from "@common/Button"
import { closeUnsupportedBrowserModal } from "@state/actions/modals"

const UnsupportedBrowserModal = ({ show = false }) => {
  return (
    <Modal show={show} showCloseButton={false}>
      <div className="modal-header">
        <h4 className="modal-title mx-auto">You must use Safari version 11.1 or higher</h4>
      </div>
      <p className="text-center my-6">In alternative you can use Chrome or Brave browsers.</p>
      <div className="flex">
        <Button className="mx-auto" action={closeUnsupportedBrowserModal}>
          Close
        </Button>
      </div>
    </Modal>
  )
}

export default UnsupportedBrowserModal
