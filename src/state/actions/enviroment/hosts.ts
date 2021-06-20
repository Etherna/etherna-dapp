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
 */

import SwarmBeeClient from "@classes/SwarmBeeClient"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

export const updateIndexHost = (host: string, apiPath?: string) => {
  window.localStorage.setItem("indexHost", host)
  window.localStorage.setItem("indexApiPath", apiPath || "")
  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_INDEXHOST,
    indexHost: host,
    apiPath: apiPath,
    indexClient: new EthernaIndexClient({ host, apiPath })
  })
}

export const updateGatewayHost = (host: string, apiPath?: string) => {
  window.localStorage.setItem("gatewayHost", host)
  window.localStorage.setItem("gatewayApiPath", apiPath || "")
  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_GATEWAY_HOST,
    gatewayHost: host,
    apiPath: apiPath,
    beeClient: new SwarmBeeClient(host)
  })
}

export const resetIndexHost = () => {
  const host = process.env.REACT_APP_INDEX_HOST
  const apiPath = process.env.REACT_APP_INDEX_API_PATH
  updateIndexHost(host, apiPath)
}

export const resetGatewayHost = () => {
  const host = process.env.REACT_APP_GATEWAY_HOST
  const apiPath = process.env.REACT_APP_INDEX_API_PATH
  updateGatewayHost(host, apiPath)
}
