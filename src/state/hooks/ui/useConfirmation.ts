import { useDispatch } from "react-redux"
import { Dispatch } from "redux"

import { UIActions, UIActionTypes } from "@state/reducers/uiReducer"

let waitingInterval: number | undefined
let waitingStatus: boolean | undefined

const useConfirmation = () => {
  const dispatch = useDispatch<Dispatch<UIActions>>()

  const showConfirmation = (title: string, message: string) => {
    waitingStatus = undefined

    dispatch({
      type: UIActionTypes.TOGGLE_CONFIRMATION,
      confirmMessage: message,
      confirmTitle: title
    })
  }

  const hideConfirmation = (success = true) => {
    dispatch({
      type: UIActionTypes.TOGGLE_CONFIRMATION
    })

    waitingStatus = success
  }

  const waitConfirmation = async (
    title: string, message: string, confirmTitle?: string, confirmType?: "default" | "destructive"
  ) => {
    dispatch({
      type: UIActionTypes.TOGGLE_CONFIRMATION,
      confirmMessage: message,
      confirmTitle: title,
      confirmButtonTitle: confirmTitle,
      confirmButtonType: confirmType
    })

    clearInterval(waitingInterval)

    return new Promise<boolean>((resolve) => {
      waitingInterval = window.setInterval(() => {
        const confirmationSuccess = waitingStatus

        if (confirmationSuccess !== undefined) {
          dispatch({
            type: UIActionTypes.TOGGLE_CONFIRMATION
          })

          clearInterval(waitingInterval)

          waitingStatus = undefined
          waitingInterval = undefined

          resolve(confirmationSuccess)
        }
      }, 500)
    })
  }

  return {
    showConfirmation,
    hideConfirmation,
    waitConfirmation
  }
}

export default useConfirmation
