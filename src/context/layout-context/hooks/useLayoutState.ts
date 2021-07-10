import { useContext } from "react"

import { LayoutContext } from ".."

const useLayoutState = () => useContext(LayoutContext)!

export default useLayoutState
