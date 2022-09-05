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

import { AlertPopup } from "@/components/ui/actions"
import { useErrorMessage, useConfirmation } from "@/state/hooks/ui"
import useSelector from "@/state/useSelector"

const Popups: React.FC = () => {
  const {
    errorTitle,
    errorMessage,
    confirmTitle,
    confirmMessage,
    confirmButtonTitle,
    confirmButtonType,
  } = useSelector(state => state.ui)

  const { hideConfirmation } = useConfirmation()
  const { hideError } = useErrorMessage()

  return (
    <>
      <AlertPopup
        show={!!errorTitle || !!errorMessage}
        icon="error"
        title={errorTitle}
        message={errorMessage}
        onAction={hideError}
      />

      <AlertPopup
        show={!!confirmTitle || !!confirmMessage}
        icon="error"
        title={confirmTitle}
        message={confirmMessage}
        actions={[
          {
            title: "Cancel",
            type: "cancel",
            action: () => hideConfirmation(false),
          },
          {
            title: confirmButtonTitle ?? "OK",
            type: confirmButtonType ?? "default",
            action: () => hideConfirmation(true),
          },
        ]}
      />
    </>
  )
}

export default Popups
