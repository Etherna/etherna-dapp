import React from "react"
import loadable from "@loadable/component"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import pMinDelay from "p-min-delay"

import "./scss/theme.scss"

import {
    ChannelOwnerRoute,
    SignedInRoute,
    WatchRoute,
} from "./ProtectedRoutes"
import PageLoader from "@common/PageLoader"
import Layout from "@components/layout/DefaultLayout"
import { ShortcutWrapper } from "@keyboard"
import StateWrapper from "@state/wrapper"
import { getBasename } from "@routes"

const AsyncHome = loadable(() => pMinDelay(import(/* webpackChunkName: "home" */ "@pages/home"), 200), {
    fallback: <PageLoader />
})
const AsyncChannel = loadable(() => pMinDelay(import(/* webpackChunkName: "channel" */ "@pages/channel"), 200), {
    fallback: <PageLoader />
})
const AsyncChannelEdit = loadable(() => pMinDelay(import(/* webpackChunkName: "channel-edit" */ "@pages/channelEdit"), 200), {
    fallback: <PageLoader />
})
const AsyncChannels = loadable(() => pMinDelay(import(/* webpackChunkName: "channels" */ "@pages/channels"), 200), {
    fallback: <PageLoader />
})
const AsyncWatch = loadable(() => pMinDelay(import(/* webpackChunkName: "watch" */ "@pages/watch"), 200), {
    fallback: <PageLoader />
})
const AsyncVideoSettings = loadable(() => pMinDelay(import(/* webpackChunkName: "videoSettings" */ "@pages/videoSettings"), 200), {
    fallback: <PageLoader />
})
const AsyncUpload = loadable(() => pMinDelay(import(/* webpackChunkName: "upload" */ "@pages/upload"), 200), {
    fallback: <PageLoader />
})
const AsyncHowItWorks = loadable(() => pMinDelay(import(/* webpackChunkName: "how-it-works" */ "@pages/how-it-works"), 200), {
    fallback: <PageLoader />
})
const AsyncShortcuts = loadable(() => pMinDelay(import(/* webpackChunkName: "shortcuts" */ "@pages/shortcuts"), 200), {
    fallback: <PageLoader />
})
const AsyncNotFound = loadable(() => pMinDelay(import(/* webpackChunkName: "404" */ "@pages/404"), 200), {
    fallback: <PageLoader />
})

const basename = getBasename()

const Home = () => <AsyncHome />
const Channel = () => <AsyncChannel />
const ChannelEdit = () => <AsyncChannelEdit />
const Channels = () => <AsyncChannels />
const Watch = () => <AsyncWatch />
const VideoSettings = () => <AsyncVideoSettings />
const Upload = () => <AsyncUpload />
const HowItWorks = () => <AsyncHowItWorks />
const Shortcuts = () => <AsyncShortcuts />
const NotFound = () => <AsyncNotFound />

const Root = () => {
    return (
        <StateWrapper>
            <ShortcutWrapper>
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
                            <SignedInRoute path={"/videoSettings"}>
                                <VideoSettings />
                            </SignedInRoute>
                            <SignedInRoute path={"/upload"}>
                                <Upload />
                            </SignedInRoute>
                            <Route path={"/how-it-works"}>
                                <HowItWorks />
                            </Route>
                            <Route path={"/shortcuts"}>
                                <Shortcuts />
                            </Route>
                            <Route path="*">
                                <NotFound />
                            </Route>
                        </Switch>
                    </Layout>
                </Router>
            </ShortcutWrapper>
        </StateWrapper>
    )
}

export default Root
