import { Dispatch } from "react"

export type LayoutContextStore = [state: LayoutContextState, dispatch: Dispatch<AnyLayoutAction>]

export type LayoutContextState = {
  emptyLayout: boolean
  hideSidebar: boolean
  floatingSidebar: boolean
}
