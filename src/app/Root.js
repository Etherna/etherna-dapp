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
                    <Route path="/" exact component={Home} />
                    <Route path="/channels" exact component={Channels} />
                    <Route path="/channel/:id" exact component={Channel} />
                    <ChannelOwnerRoute path="/channel/:id/edit" exact component={ChannelEdit} />
                    <WatchRoute path="/watch" exact component={Watch} />
                    <HasChannelRoute path="/upload" exact component={Upload} />
                    <Route path="/how-it-works" exact component={HowItWorks} />
                    <Route path="*" component={NotFound} />
                </Switch>
            </Router>
        </StateWrapper>
    )
}

export default Root