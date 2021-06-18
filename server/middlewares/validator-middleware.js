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

const { createProxyMiddleware } = require("http-proxy-middleware")

require("../utils/env")


// Consts
const GatewayValidPathsRegex = /^\/(bytes|chunks|files|dirs|tags|pin|soc|feeds|pss)\/?.*/
const ValidatorHost = process.env.GATEWAY_VALIDATOR_PROXY_HOST


// Middleware
module.exports.ValidatorMiddleware = createProxyMiddleware(
  (pathname, req) => {
    return !GatewayValidPathsRegex.test(pathname)
  },
  {
    target: ValidatorHost,
    changeOrigin: true,
    secure: false,
    logLevel: "info" && "warn" && "error"
  }
)
