import { Bzz } from "@erebos/bzz"

import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import IndexClient from "@utils/indexClient/client"

export const updateIndexHost = (host, apiPath) => {
  window.localStorage.setItem("indexHost", host)
  window.localStorage.setItem("indexApiPath", apiPath || "")
  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_INDEXHOST,
    indexHost: host,
    indexApiPath: apiPath,
    indexClient: new IndexClient({ host, apiPath })
  })
}

export const updateGatewayHost = host => {
  window.localStorage.setItem("gatewayHost", host)
  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_GATEWAY_HOST,
    gatewayHost: host,
    bzzClient: new Bzz({ url: host })
  })
}

export const resetIndexHost = () => {
  const host = process.env.REACT_APP_INDEX_HOST
  const apiPath = process.env.REACT_APP_INDEX_API_PATH
  updateIndexHost(host, apiPath)
}

export const resetGatewayHost = () => {
  const host = process.env.REACT_APP_SWARM_HOST
  updateGatewayHost(host)
}
