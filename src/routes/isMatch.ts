import { matchPath } from "react-router-dom"

import getBasename from "./getBasename"

const isMatch = (path: string, exact = false) => {
  return (
    matchPath(window.location.pathname, {
      exact,
      path: getBasename() + path,
    }) !== null
  )
}

export default isMatch
