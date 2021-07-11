import { Dispatch } from "react"

import { AnyLayoutAction } from "."

export type LayoutContextStore = [state: LayoutContextState, dispatch: Dispatch<AnyLayoutAction>]

export type LayoutContextState = {
  emptyLayout: boolean
  hideSidebar: boolean
  floatingSidebar: boolean
}
