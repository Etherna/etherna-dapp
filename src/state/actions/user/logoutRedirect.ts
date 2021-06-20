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

import { store } from "@state/store"

/**
 * Redirect to the service login page
 * @param service Service to signin
 */
const logoutRedirect = (service: "index" | "gateway" | String | null = null) => {
  const { indexClient, gatewayClient } = store.getState().env

  // strip query params
  const redirectUrl = window.location.origin + window.location.pathname

  switch (service) {
    case "index":
      indexClient.logoutRedirect(redirectUrl)
      break
    case "gateway":
      gatewayClient.logoutRedirect(redirectUrl)
      break
    case null:
    case undefined:
      indexClient.logoutRedirect(redirectUrl + "?signout=gateway")
      break
    default:
      break
  }
}

export default logoutRedirect
