import React from "react"
import loadable from "@loadable/component"
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

import "./scss/theme.scss"

import {
    ChannelOwnerRoute,
    HasChannelRoute,
    WatchRoute
} from "./ProtectedRoutes"
import StateWrapper from "@state/wrapper"

const AsyncHome = loadable(() => import("@pages/home"), {
    fallback: <div></div>
})
const  AsyncChannel = loadable(() => import("@pages/channel"), {
    fallback: <div></div>
})
const  AsyncChannelEdit = loadable(() => import("@pages/channelEdit"), {
    fallback: <div></div>
})
const  AsyncChannels = loadable(() => import("@pages/channels"), {
    fallback: <div></div>
})
const  AsyncWatch = loadable(() => import("@pages/watch"), {
    fallback: <div></div>
})
const  AsyncUpload = loadable(() => import("@pages/upload"), {
    fallback: <div></div>
})
const  AsyncHowItWorks = loadable(() => import("@pages/how-it-works"), {
    fallback: <div></div>
})
const AsyncNotFound = loadable(() => import("@pages/404"), {
    fallback: <div></div>
})

const Home = () => (<AsyncHome />)
const Channel = () => (<AsyncChannel />)
const ChannelEdit = () => (<AsyncChannelEdit />)
const Channels = () => (<AsyncChannels />)
const Watch = () => (<AsyncWatch />)
const Upload = () => (<AsyncUpload />)
const HowItWorks = () => (<AsyncHowItWorks />)
const NotFound = () => (<AsyncNotFound />)

const Root = () => {
    return (
        <StateWrapper>
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <Home />
                    </Route>
                    <Route path="/channels" exact>
                        <Channels />
                    </Route>
                    <Route path="/channel/:id" exact>
                        <Channel />
                    </Route>
                    <ChannelOwnerRoute path="/channel/:id/edit" exact>
                        <ChannelEdit />
                    </ChannelOwnerRoute>
                    <WatchRoute path="/watch">
                        <Watch />
                    </WatchRoute>
                    <HasChannelRoute path="/upload">
                        <Upload />
                    </HasChannelRoute>
                    <Route path="/how-it-works">
                        <HowItWorks />
                    </Route>
                    <Route path="*">
                        <NotFound />
                    </Route>
                </Switch>
            </Router>
        </StateWrapper>
    )
}

export default Root