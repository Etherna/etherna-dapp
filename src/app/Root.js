import React from "react"
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
import NotFound from "@pages/404"
import Home from "@pages/home"
import Channel from "@pages/channel"
import ChannelEdit from "@pages/channelEdit"
import Channels from "@pages/channels"
import Watch from "@pages/watch"
import Upload from "@pages/upload"
import HowItWorks from "@pages/how-it-works"

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
                    <WatchRoute path="/watch*">
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