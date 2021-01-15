import { createSelectorHook } from "react-redux"

import { AppState } from "./typings"

const useSelector = createSelectorHook<AppState>()

export default useSelector
