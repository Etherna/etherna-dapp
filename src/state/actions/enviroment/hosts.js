import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

export const updateIndexHost = host => {
    window.localStorage.setItem("indexHost", host)
    store.dispatch({
        type: EnvActionTypes.ENV_UPDATE_INDEXHOST,
        indexHost: host,
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
    const host = process.env.INDEX_HOST
    updateIndexHost(host)
}

export const resetGatewayHost = () => {
    const host = process.env.GATEWAY_HOST
    updateGatewayHost(host)
}
