import React from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

import "./style.scss"

import NotFound from "pages/404"
import Home from "pages/home"
import Channel from "pages/channel"
import ChannelEdit from "pages/channelEdit"
import Channels from "pages/channels"
import Watch from "pages/watch"
import Upload from "pages/upload"
import HowItWorks from "pages/how-it-works"

const Root = () => {
    return (
        <Router>
            <Switch>
                <Route path="./" exact component={Home} />
                <Route path="./channels" exact component={Channels} />
                <Route path="./channel/:id" exact component={Channel} />
                <Route path="./channel/:id/edit" exact component={ChannelEdit} />
                <Route path="./watch" exact component={Watch} />
                <Route path="./upload" exact component={Upload} />
                <Route path="./how-it-works" exact component={HowItWorks} />
                <Route path="*" component={NotFound} />
            </Switch>
        </Router>
    )
}

export default Root