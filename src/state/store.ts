/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
