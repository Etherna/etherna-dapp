import { combineReducers } from "redux"

import enviromentReducer from "./enviromentReducer"
import profileReducer from "./profileReducer"
import uiReducer from "./uiReducer"
import userReducer from "./userReducer"

export default combineReducers({
  env: enviromentReducer,
  profile: profileReducer,
  ui: uiReducer,
  user: userReducer,
})
