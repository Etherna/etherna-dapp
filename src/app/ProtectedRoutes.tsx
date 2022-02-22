/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React from "react"
import { Route, Redirect } from "react-router-dom"

import Routes from "@routes"
import useSelector from "@state/useSelector"
import SigninMessage from "@components/navigation/SigninMessage"

type RouteProps = {
  path: string
  exact?: boolean
  children: React.ReactNode
}

export const SignedInRoute = ({ path, exact, children }: RouteProps) => {
  const { isSignedIn, isSignedInGateway } = useSelector(state => state.user)
  const isSigningIn = isSignedIn === undefined || isSignedInGateway === undefined
  const isFullySignedIn = isSignedIn === true && isSignedInGateway === true

  return (
    <Route
      path={path}
      exact={exact}
      render={() =>
        isSigningIn ? null : isFullySignedIn ? (
          children
        ) : (
          <SigninMessage />
        )
      }
    />
  )
}

export const ProfileOwnerRoute = ({ path, exact, children }: RouteProps) => {
  const { address, isSignedIn } = useSelector(state => state.user)

  return (
    <Route
      path={path}
      exact={exact}
      render={({ location, match }) =>
        isSignedIn === undefined ? (
          null
        ) : (
          address && match.params.id === address ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: Routes.getProfileLink(match.params.id!),
                state: {
                  from: location,
                },
              }}
            />
          )
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
