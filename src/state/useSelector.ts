import { createSelectorHook } from "react-redux"

import { AppState } from "./types"

const useSelector = createSelectorHook<AppState>()

export default useSelector
