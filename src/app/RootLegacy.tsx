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

import React, { useState } from "react"

import Modal from "@common/Modal"
import Button from "@common/Button"
import useLocalStorage from "@hooks/useLocalStorage"

const RootLegacy: React.FC = () => {
  const [hideUnsupported, setHideUnsupported] = useLocalStorage("setting:hide-unsupported", false)
  const [open, setOpen] = useState(!hideUnsupported)

  const closeAndDontShowAgain = () => {
    setHideUnsupported(true)
    close()
  }

  const close = () => {
    setOpen(false)
  }

  return (
    <Modal
      show={open}
      title="Update your browser"
      onClose={() => setOpen(false)}
      footerButtons={
        <>
          <Button modifier="secondary" onClick={close}>Continue</Button>
          <Button modifier="warning" onClick={closeAndDontShowAgain}>Don&apos;t show again</Button>
        </>
      }
    >
      Seems like you are using an old browser and some features may appear broken.
      <strong> Please consider updating your browser</strong>.
    </Modal>
  )
}

export default RootLegacy
