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
import useConfirmation from "@/hooks/useConfirmation"
import useErrorMessage from "@/hooks/useErrorMessage"
import useUIStore from "@/stores/ui"

const Popups: React.FC = () => {
  const confirmation = useUIStore(state => state.confirmation)
  const error = useUIStore(state => state.error)

  const { hideConfirmation } = useConfirmation()
  const { hideError } = useErrorMessage()

  return (
    <>
      <AlertPopup
        show={!!error}
        icon="error"
        title={error?.title}
        message={error?.message}
        onAction={hideError}
      />

      <AlertPopup
        show={!!confirmation}
        icon="error"
        title={confirmation?.title}
        message={confirmation?.message}
        actions={[
          {
            title: "Cancel",
            type: "cancel",
            action: () => hideConfirmation(false),
          },
          {
            title: confirmation?.buttonTitle ?? "OK",
            type: confirmation?.buttonType ?? "default",
            action: () => hideConfirmation(true),
          },
        ]}
      />
    </>
  )
}

export default Popups
