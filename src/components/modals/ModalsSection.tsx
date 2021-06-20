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

import UnsupportedBrowserModal from "./UnsupportedBrowserModal"
import ErrorModal from "./ErrorModal"
import ShortcutModal from "./ShortcutModal"
import ImageCropModal from "./ImageCropModal"
import useSelector from "@state/useSelector"

const ModalsSection = () => {
  const {
    errorMessage,
    errorTitle,
    showUnsupportedModal,
    isEditingShortcut,
    isCroppingImage,
  } = useSelector(state => state.ui)
  const mustConsentError =
    errorMessage &&
    errorMessage.substring(0, 65) === "Error: Web3 Wallet Message Signature: User denied message signature."

  return (
    <section>
      <UnsupportedBrowserModal show={showUnsupportedModal} />

      <ErrorModal
        title={errorTitle}
        error={errorMessage || ""}
        show={!!(errorMessage && !mustConsentError)}
      />

      <ShortcutModal show={isEditingShortcut} />

      <ImageCropModal show={isCroppingImage} />
    </section>
  )
}

export default ModalsSection
