import { Dispatch } from "redux"
import { useDispatch } from "react-redux"

import { UIActions, UIActionTypes } from "@state/reducers/uiReducer"

const useErrorMessage = () => {
  const dispatch = useDispatch<Dispatch<UIActions>>()

  const showError = (title: string, message: string) => {
    dispatch({
      type: UIActionTypes.SHOW_ERROR,
      errorMessage: message,
      errorTitle: title
    })
  }

  const hideError = () => {
    dispatch({
      type: UIActionTypes.HIDE_ERROR
    })
  }

  return {
    showError,
    hideError
  }
}

export default useErrorMessage
