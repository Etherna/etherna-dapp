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
    children
}) => {
    const { isSignedIn } = useSelector(state => state.user)

    return (
        <Route
            path={path}
            exact={exact}
            render={({ location }) =>
                isSignedIn ? (
                    children
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
    children
}) => {
    const { existsOnIndex } = useSelector(state => state.profile)

    return (
        <Route
            path={path}
            exact={exact}
            render={({ location }) =>
                existsOnIndex ? (
                    children
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
    children
}) => {
    const { address } = useSelector(state => state.user)

    return (
        <Route
            path={path}
            exact={exact}
            render={({ location, match }) =>
                match.params.id === address ? (
                    children
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
    children
}) => {
    const hasVideoParam = (search) => {
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
                    <Redirect to = {
                        {
                            pathname: Routes.getHomeLink()
                        }
                    } />
                )
            }
        />
    )
}