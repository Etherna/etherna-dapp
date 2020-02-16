import { combineReducers } from "redux"

import uiReducer from "./uiReducer"
import userReducer from "./userReducer"
import profileReducer from "./profileReducer"
import channelsReducer from "./channelsReducer"

export default combineReducers({
    ui: uiReducer,
    user: userReducer,
    profile: profileReducer,
    channel: channelsReducer
})
