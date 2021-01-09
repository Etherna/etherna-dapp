import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

export const darkModeEnabled = () => {
  const userPref = window.localStorage.getItem("darkMode")
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
  window.localStorage.setItem("darkMode", darkMode ? "true" : "false")
  loadDarkMode()

  store.dispatch({
    type: EnvActionTypes.ENV_TOGGLE_DARK_MODE,
    darkMode,
  })
}
