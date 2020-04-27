import React from "react"
import ReactDOM from "react-dom"

import Root from "./app/Root"
import prefetch from "./prefetch"
import * as serviceWorker from "./serviceWorker"

const RenderDOM = () => {
    ReactDOM.render(<Root />, document.getElementById("root"))
}

// Prefetch data for SEO
// Once the data has been set to a window variable call RenderDOM
prefetch(RenderDOM)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
