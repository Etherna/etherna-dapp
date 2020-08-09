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
    window.document.body.classList.remove("theme-light")
    window.document.body.classList.add("theme-dark")
  } else {
    window.document.body.classList.remove("theme-dark")
    window.document.body.classList.add("theme-light")
  }
  return darkMode
}

export const toggleDarkMode = darkMode => {
  window.localStorage.setItem("darkMode", darkMode ? "true" : "false")
  loadDarkMode()

  store.dispatch({
    type: EnvActionTypes.TOGGLE_DARK_MODE,
    darkMode,
  })
}
