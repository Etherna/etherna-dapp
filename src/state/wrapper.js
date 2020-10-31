import React from "react"
import { Provider } from "react-redux"

import { store } from "./store"

const StateProviderWrapper = ({ children }) => (
  <Provider store={store}>{children}</Provider>
)

export default StateProviderWrapper
