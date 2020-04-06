import React from "react"
import { useSelector } from "react-redux"
import {
    Route,
    Redirect
} from "react-router-dom"

import * as Routes from "@routes"

export const SignedInRoute = ({
    path,
    exact,
    component
}) => {
    const { isSignedIn } = useSelector(state => state.user)

    return (
        <Route
            path={path}
            exact={exact}
            render={({ location }) =>
                isSignedIn ? (
                    component
                ) : (
                    <Redirect to = {
                        {
                            pathname: Routes.getHomeLink(),
                            state: {
                                from: location
                            }
                        }
                    } />
                )
            }
        />
    )
}

export const HasChannelRoute = ({
    path,
    exact,
    component
}) => {
    const { existsOnIndex } = useSelector(state => state.profile)

    return (
        <Route
            path={path}
            exact={exact}
            render={({ location }) =>
                existsOnIndex ? (
                    component
                ) : (
                    <Redirect to = {
                        {
                            pathname: Routes.getHomeLink(),
                            state: {
                                from: location
                            }
                        }
                    } />
                )
            }
        />
    )
}

export const ChannelOwnerRoute = ({
    path,
    exact,
    component
}) => {
    const { address } = useSelector(state => state.user)

    return (
        <Route
            path={path}
            exact={exact}
            render={({ location, match }) =>
                match.params.id === address ? (
                    component
                ) : (
                    <Redirect to = {
                        {
                            pathname: Routes.getChannelLink(match.params.id),
                            state: {
                                from: location
                            }
                        }
                    } />
                )
            }
        />
    )
}

export const WatchRoute = ({
    path,
    exact,
    component
}) => {
    return (
        <Route
            path={path}
            exact={exact}
            render={({ location }) => {
                const query = new URLSearchParams(location.search)
                return (
                    query.has("v") && query.get("v") !== "" ? (
                        component
                    ) : (
                        <Redirect to = {
                            {
                                pathname: Routes.getHomeLink(),
                                state: {
                                    from: location
                                }
                            }
                        } />
                    )
                )
            }}
        />
    )
}