import React from "react"
import { Provider } from "react-redux"

import { store } from "./store"

type WrapperProps = {
  children: React.ReactNode
}

const StateProviderWrapper = ({ children }: WrapperProps) => (
  <Provider store={store}>{children}</Provider>
)

export default StateProviderWrapper
