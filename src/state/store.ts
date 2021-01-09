import { createStore, applyMiddleware, compose, Middleware, combineReducers } from "redux"
import thunkMiddleware from "redux-thunk"
import { createLogger } from "redux-logger"

import enviromentReducer from "./reducers/enviromentReducer"
import profileReducer from "./reducers/profileReducer"
import uiReducer from "./reducers/uiReducer"
import userReducer from "./reducers/userReducer"
import { WindowReduxDev } from "typings/window"

/**
 * Configure a new redux store
 */
function configureStore() {
  const reduxDevWindow = window as WindowReduxDev
  const composeEnhancers = reduxDevWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const middleware: Middleware[] = [thunkMiddleware]

  if (process.env.NODE_ENV !== "production") {
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
