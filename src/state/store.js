import { createStore, applyMiddleware, compose } from "redux"
import thunkMiddleware from "redux-thunk"
import { createLogger } from "redux-logger"

import reducers from "./reducers"

/**
 * Configure a new redux store
 */
function configureStore() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const middleware = [thunkMiddleware]

  if (process.env.NODE_ENV !== "production") {
    middleware.push(createLogger())
  }

  return createStore(
    reducers,
    composeEnhancers(applyMiddleware(...middleware))
  )
}

/**
 * Redux store
 */
const store = configureStore()

export { configureStore, store }
