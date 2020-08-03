import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

export const updateIndexHost = (host, version) => {
    window.localStorage.setItem("indexHost", host)
    window.localStorage.setItem("indexApiVersion", version || "")
    store.dispatch({
        type: EnvActionTypes.ENV_UPDATE_INDEXHOST,
        indexHost: host,
        indexApiVersion: version
    })
}

export const updateGatewayHost = host => {
    window.localStorage.setItem("gatewayHost", host)
    store.dispatch({
        type: EnvActionTypes.ENV_UPDATE_GATEWAY_HOST,
        gatewayHost: host,
    })
}

export const resetIndexHost = () => {
    const host = process.env.REACT_APP_INDEX_HOST
    const version = process.env.REACT_APP_INDEX_API_VERSION
    updateIndexHost(host, version)
}

export const resetGatewayHost = () => {
    const host = process.env.REACT_APP_GATEWAY_HOST
    updateGatewayHost(host)
}
