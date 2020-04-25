import React from "react"
import loadable from "@loadable/component"
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"
import pMinDelay from 'p-min-delay'

import "./scss/theme.scss"

import {
    ChannelOwnerRoute,
    HasChannelRoute,
    WatchRoute
} from "./ProtectedRoutes"
import PageLoader from "@common/PageLoader"
import Layout from "@components/layout/DefaultLayout"
import StateWrapper from "@state/wrapper"
import { getBasename, isMatch } from "@routes"

const AsyncHome = loadable(() => pMinDelay(import(/* webpackChunkName: "home" */ "@pages/home"), 200), {
    fallback: <PageLoader />
})
const  AsyncChannel = loadable(() => pMinDelay(import(/* webpackChunkName: "channel" */ "@pages/channel"), 200), {
    fallback: <PageLoader />
})
const  AsyncChannelEdit = loadable(() => pMinDelay(import(/* webpackChunkName: "channel-edit" */ "@pages/channelEdit"), 200), {
    fallback: <PageLoader />
})
const  AsyncChannels = loadable(() => pMinDelay(import(/* webpackChunkName: "channels" */ "@pages/channels"), 200), {
    fallback: <PageLoader />
})
const  AsyncWatch = loadable(() => pMinDelay(import(/* webpackChunkName: "watch" */ "@pages/watch"), 200), {
    fallback: <PageLoader />
})
const  AsyncUpload = loadable(() => pMinDelay(import(/* webpackChunkName: "upload" */ "@pages/upload"), 200), {
    fallback: <PageLoader />
})
const  AsyncHowItWorks = loadable(() => pMinDelay(import(/* webpackChunkName: "how-it-works" */ "@pages/how-it-works"), 200), {
    fallback: <PageLoader />
})
const AsyncNotFound = loadable(() => pMinDelay(import(/* webpackChunkName: "404" */ "@pages/404"), 200), {
    fallback: <PageLoader />
})

const basename = getBasename()

const Home = isMatch("/", true)
    ? require("@pages/home").default
    : () => (<AsyncHome />)
const Channel = isMatch("/channel/:id", true)
    ? require("@pages/channel").default
    : () => (<AsyncChannel />)
const ChannelEdit = isMatch("/channel/:id/edit", true)
    ? require("@pages/channelEdit").default
    : () => (<AsyncChannelEdit />)
const Channels = isMatch("/channels", true)
    ? require("@pages/channels").default
    : () => (<AsyncChannels />)
const Watch = isMatch("/watch", false)
    ? require("@pages/watch").default
    : () => (<AsyncWatch />)
const Upload = isMatch("/upload", false)
    ? require("@pages/upload").default
    : () => (<AsyncUpload />)
const HowItWorks = isMatch("/how-it-works", false)
    ? require("@pages/how-it-works").default
    : () => (<AsyncHowItWorks />)
const NotFound =
    () => (<AsyncNotFound />)

const Root = () => {
    return (
        <StateWrapper>
            <Router basename={basename}>
                <Layout>
                    <Switch>
                        <Route path={"/"} exact>
                            <Home />
                        </Route>
                        <Route path={"/channels"} exact>
                            <Channels />
                        </Route>
                        <Route path={"/channel/:id"} exact>
                            <Channel />
                        </Route>
                        <ChannelOwnerRoute path={"/channel/:id/edit"} exact>
                            <ChannelEdit />
                        </ChannelOwnerRoute>
                        <WatchRoute path={"/watch"}>
                            <Watch />
                        </WatchRoute>
                        <HasChannelRoute path={"/upload"}>
                            <Upload />
                        </HasChannelRoute>
                        <Route path={"/how-it-works"}>
                            <HowItWorks />
                        </Route>
                        <Route path="*">
                            <NotFound />
                        </Route>
                    </Switch>
                </Layout>
            </Router>
        </StateWrapper>
    )
}

export default Root