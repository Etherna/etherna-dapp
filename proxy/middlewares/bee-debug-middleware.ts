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

import { createProxyMiddleware } from "http-proxy-middleware"

import "../utils/env.js"

// Consts
const BeeDebugValidPathsRegex = /^\/(addresses|balances|chequebook|reservestate|settlements|transactions|stamps)\/?.*/
const BeeDebugHost = process.env.GATEWAY_PROXY_BEE_DEBUG_HOST

// Middleware
const BeeDebugMiddleware = createProxyMiddleware(
  (pathname, req) => {
    return BeeDebugValidPathsRegex.test(pathname)
  },
  {
    target: BeeDebugHost,
    changeOrigin: true,
    secure: false,
    logLevel: "error"
  }
)

export default BeeDebugMiddleware
