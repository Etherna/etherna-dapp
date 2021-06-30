import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

const DARK_MODE_STORAGE_KEY = "setting:dark-mode"

export const darkModeEnabled = () => {
  const userPref = window.localStorage.getItem(DARK_MODE_STORAGE_KEY)
  return userPref !== null
    ? userPref === "true"
    : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
}

export const loadDarkMode = () => {
  const darkMode = darkModeEnabled()
  if (darkMode) {
    window.document.documentElement.classList.add("dark")
  } else {
    window.document.documentElement.classList.remove("dark")
  }
  return darkMode
}

export const toggleDarkMode = (darkMode: boolean) => {
  window.localStorage.setItem(DARK_MODE_STORAGE_KEY, darkMode ? "true" : "false")
  loadDarkMode()

  store.dispatch({
    type: EnvActionTypes.TOGGLE_DARK_MODE,
    darkMode,
  })
}
