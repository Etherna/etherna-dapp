import { createStore, applyMiddleware, compose } from "redux"
import thunkMiddleware from "redux-thunk"
import reducer from "./reducers"

function configureStore() {
    const composeEnhancers =
        typeof window !== "undefined"
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
            : compose
    const middleware = [thunkMiddleware]

    if (process.env.NODE_ENV !== "production") {
        const logger = require("redux-logger").createLogger()
        middleware.push(logger)
    }

    return createStore(
        reducer,
        composeEnhancers(applyMiddleware(...middleware))
    )
}

const store = configureStore()

export { configureStore, store }
