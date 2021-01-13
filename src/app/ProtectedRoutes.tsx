import React from "react"
import { Route, Redirect } from "react-router-dom"

import Routes from "@routes"
import useSelector from "@state/useSelector"

type RouteProps = {
  path: string
  exact?: boolean
  children: React.ReactNode
}

export const SignedInRoute = ({ path, exact, children }: RouteProps) => {
  const { isSignedIn } = useSelector(state => state.user)

  return (
    <Route
      path={path}
      exact={exact}
      render={({ location }) =>
        isSignedIn === undefined ? null : isSignedIn === true ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: Routes.getHomeLink(),
              state: {
                from: location,
              },
            }}
          />
        )
      }
    />
  )
}

export const ProfileOwnerRoute = ({ path, exact, children }: RouteProps) => {
  const { address } = useSelector(state => state.user)

  return (
    <Route
      path={path}
      exact={exact}
      render={({ location, match }) =>
        address && match.params.id === address ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: Routes.getProfileLink(match.params.id),
              state: {
                from: location,
              },
            }}
          />
        )
      }
    />
  )
}

export const WatchRoute = ({ path, exact, children }: RouteProps) => {
  const hasVideoParam = (search: string) => {
    const query = new URLSearchParams(search)
    return query.has("v") && query.get("v") !== ""
  }
  return (
    <Route
      path={path}
      exact={exact}
      render={({ location }) =>
        hasVideoParam(location.search) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: Routes.getHomeLink(),
            }}
          />
        )
      }
    />
  )
}
