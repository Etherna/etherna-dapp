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
import fs from "fs"
import https from "https"
import path from "path"

import "./utils/env.js"
import beeValidatorResponse from "./middlewares/bee-validator-response.js"
import defaultProxyResponse from "./middlewares/default-proxy-response.js"
import fixResponseHeaders from "./utils/fix-response-headers.js"

const port = process.env.GATEWAY_PORT || 44362

const PrivateKeyPath = path.resolve("..", process.env.SSL_KEY_FILE)
const CertificatePath = path.resolve("..", process.env.SSL_CRT_FILE)
const ProxyHosts = {
  bee: process.env.GATEWAY_PROXY_BEE_HOST,
  gateway: process.env.GATEWAY_PROXY_VALIDATOR_HOST,
}

if (fs.existsSync(PrivateKeyPath) && fs.existsSync(CertificatePath)) {
  const privateKey = fs.readFileSync(PrivateKeyPath)
  const certificate = fs.readFileSync(CertificatePath)

  const httpsServer = https.createServer(
    { key: privateKey, cert: certificate },
    async (req, res) => {
      if (!req.url) {
        const respHeaders = fixResponseHeaders(req, null)
        res.writeHead(500, "Server error", respHeaders)
        res.end("Server error")
        return
      }

      const beeRegex = /^\/(bytes|chunks|bzz|tags|pins|soc|feeds|pss|stamps)\/?.*/
      const isBee = beeRegex.test(req.url)
      const standaloneNode = process.env.GATEWAY_PROXY_STANDALONE === "true"
      const shouldValidate =
        !standaloneNode && process.env.GATEWAY_PROXY_DISABLE_VALIDATION !== "true"

      let hostType: keyof typeof ProxyHosts = standaloneNode ? "bee" : "gateway"
      if (isBee) hostType = "bee"

      const host = ProxyHosts[hostType]

      const resp =
        isBee && shouldValidate
          ? await beeValidatorResponse(req, ProxyHosts.gateway, host)
          : await defaultProxyResponse(req, host)
      const data = await resp.arrayBuffer()
      const respHeaders = fixResponseHeaders(req, resp)

      res.writeHead(resp.status, resp.statusText, respHeaders)
      res.end(new Uint8Array(data))
    }
  )

  httpsServer.listen(port, () => {
    console.log(`Proxy started at: https://localhost:${port}`)
  })
} else {
  throw new Error(
    "Cannot find ssl certificates. To create new certificates check /proxy/sslcert/README.md"
  )
}
