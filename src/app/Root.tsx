import loadable from "@loadable/component"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import "./scss/theme.scss"

import { ProfileOwnerRoute, SignedInRoute, WatchRoute } from "./ProtectedRoutes"
import PageLoader from "@common/PageLoader"
import Layout from "@components/layout/DefaultLayout"
import ShortcutWrapper from "@keyboard/shortcutWrapper"
import StateWrapper from "@state/wrapper"
import { getBasename } from "@routes"

const AsyncHome = loadable(
  () => import(/* webpackChunkName: "home" */ "@pages/home"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncProfile = loadable(
  () => import(/* webpackChunkName: "profile" */ "@pages/profile"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncProfileEdit = loadable(
  () => import(/* webpackChunkName: "profile-edit" */ "@pages/profileEdit"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncProfiles = loadable(
  () => import(/* webpackChunkName: "profiles" */ "@pages/profiles"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncWatch = loadable(
  () => import(/* webpackChunkName: "watch" */ "@pages/watch"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncVideoSettings = loadable(
  () => import(/* webpackChunkName: "videoSettings" */ "@pages/videoSettings"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncUpload = loadable(
  () => import(/* webpackChunkName: "upload" */ "@pages/upload"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncShortcuts = loadable(
  () => import(/* webpackChunkName: "shortcuts" */ "@pages/shortcuts"),
  {
    fallback: <PageLoader />,
  }
)
const AsyncNotFound = loadable(
  () => import(/* webpackChunkName: "404" */ "@pages/404"),
  {
    fallback: <PageLoader />,
  }
)

const basename = getBasename()

const Home = () => <AsyncHome />
const Profile = () => <AsyncProfile />
const ProfileEdit = () => <AsyncProfileEdit />
const Profiles = () => <AsyncProfiles />
const Watch = () => <AsyncWatch />
const VideoSettings = () => <AsyncVideoSettings />
const Upload = () => <AsyncUpload />
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
              <Route path={"/profiles"} exact>
                <Profiles />
              </Route>
              <Route path={"/profile/:id"} exact>
                <Profile />
              </Route>
              <ProfileOwnerRoute path={"/profile/:id/edit"} exact>
                <ProfileEdit />
              </ProfileOwnerRoute>
              <WatchRoute path={"/watch"}>
                <Watch />
              </WatchRoute>
              <SignedInRoute path={"/videoSettings"}>
                <VideoSettings />
              </SignedInRoute>
              <SignedInRoute path={"/upload"}>
                <Upload />
              </SignedInRoute>
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
