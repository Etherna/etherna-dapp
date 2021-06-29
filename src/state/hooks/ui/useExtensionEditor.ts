import { useDispatch } from "react-redux"
import { Dispatch } from "redux"

import { UIActions, UIActionTypes } from "@state/reducers/uiReducer"

const useExtensionEditor = () => {
  const dispatch = useDispatch<Dispatch<UIActions>>()

  const showEditor = (name: "index" | "gateway", url: string) => {
    dispatch({
      type: UIActionTypes.SHOW_EXTENSION_HOSTS_EDITOR,
      extensionName: name,
      extensionUrl: url
    })
  }

  const hideEditor = () => {
    dispatch({ type: UIActionTypes.HIDE_EXTENSION_HOSTS_EDITOR })
  }

  return {
    showEditor,
    hideEditor
  }
}

export default useExtensionEditor
