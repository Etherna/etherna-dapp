import SwarmBeeClient from "@classes/SwarmBeeClient"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { safeURL, urlOrigin } from "@utils/urls"

export const updateIndexHost = (host: string, apiPath?: string) => {
  window.localStorage.setItem("indexHost", host)
  window.localStorage.setItem("indexApiPath", apiPath || "")
  store.dispatch({
    type: EnvActionTypes.UPDATE_INDEXHOST,
    indexHost: host,
    apiPath: apiPath,
    indexClient: new EthernaIndexClient({ host, apiPath })
  })
}

export const updateGatewayHost = (host: string, apiPath?: string) => {
  window.localStorage.setItem("gatewayHost", host)
  window.localStorage.setItem("gatewayApiPath", apiPath || "")
  store.dispatch({
    type: EnvActionTypes.UPDATE_GATEWAY_HOST,
    gatewayHost: host,
    apiPath: apiPath,
    beeClient: new SwarmBeeClient(host)
  })
}

export const resetIndexHost = () => {
  const host = urlOrigin(import.meta.env.VITE_APP_INDEX_URL)!
  const apiPath = safeURL(import.meta.env.VITE_APP_INDEX_URL)!.pathname
  updateIndexHost(host, apiPath)
}

export const resetGatewayHost = () => {
  const host = urlOrigin(import.meta.env.VITE_APP_INDEX_URL)!
  const apiPath = safeURL(import.meta.env.VITE_APP_INDEX_URL)!.pathname
  updateGatewayHost(host, apiPath)
}
