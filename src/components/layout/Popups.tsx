import React from "react"

import AlertPopup from "@components/common/AlertPopup"
import useSelector from "@state/useSelector"
import { useErrorMessage, useConfirmation } from "@state/hooks/ui"

const Popups: React.FC = () => {
  const {
    errorTitle,
    errorMessage,
    confirmTitle,
    confirmMessage,
    confirmButtonTitle,
    confirmButtonType
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
        actions={[{
          title: "Cancel",
          type: "cancel",
          action: () => hideConfirmation(false)
        }, {
          title: confirmButtonTitle ?? "OK",
          type: confirmButtonType ?? "default",
          action: () => hideConfirmation(true)
        }]}
      />
    </>
  )
}

export default Popups
