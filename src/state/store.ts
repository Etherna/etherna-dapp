import { createStore, applyMiddleware, compose, Middleware, combineReducers } from "redux"
import thunkMiddleware from "redux-thunk"
import { createLogger } from "redux-logger"

import enviromentReducer from "./reducers/enviromentReducer"
import profileReducer from "./reducers/profileReducer"
import uiReducer from "./reducers/uiReducer"
import userReducer from "./reducers/userReducer"

/**
 * Configure a new redux store
 */
function configureStore() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const middleware: Middleware[] = [thunkMiddleware]

  if (import.meta.env.DEV) {
    middleware.push(createLogger())
  }

  return createStore(
    combineReducers({
      env: enviromentReducer,
      profile: profileReducer,
      ui: uiReducer,
      user: userReducer,
    }),
    composeEnhancers(applyMiddleware(...middleware))
  )
}

/**
 * Redux store
 */
const store = configureStore()

export { configureStore, store }
