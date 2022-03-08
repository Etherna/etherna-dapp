import { useDispatch } from "react-redux"
import type { Dispatch } from "redux"

import useSelector from "@state/useSelector"
import { EnvActions, EnvActionTypes } from "@state/reducers/enviromentReducer"
import { updateDarkMode } from "@utils/dark-mode"

export default function useDarkMode() {
  const { darkMode } = useSelector(state => state.env)
  const dispatch = useDispatch<Dispatch<EnvActions>>()

  const toggleDarkMode = (darkMode: boolean) => {
    updateDarkMode(darkMode)

    dispatch({
      type: EnvActionTypes.TOGGLE_DARK_MODE,
      darkMode,
    })
  }

  return {
    darkMode,
    toggleDarkMode,
  }
}
