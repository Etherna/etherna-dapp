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

import chalk from "chalk"
import fs from "fs"
import https from "https"
import fetch from "node-fetch"
import path from "path"

const port = process.env.BEE_HTTPS_PORT || 1643

const PrivateKeyPath = path.resolve(process.env.SSL_KEY_FILE)
const CertificatePath = path.resolve(process.env.SSL_CRT_FILE)

export default function proxyBeeOverHttps() {
  if (fs.existsSync(PrivateKeyPath) && fs.existsSync(CertificatePath)) {
    const privateKey = fs.readFileSync(PrivateKeyPath)
    const certificate = fs.readFileSync(CertificatePath)

    const httpsServer = https.createServer(
      { key: privateKey, cert: certificate },
      async (req, res) => {
        if (!req.url) {
          const respHeaders = fixResponseHeaders(req)
          res.writeHead(500, "Server error", respHeaders)
          res.end("Server error")
          return
        }
        if (req.method === "OPTIONS") {
          // send successfull preflight response
          const respHeaders = fixResponseHeaders(req)
          res.writeHead(200, "OK", respHeaders)
          res.end()
          return
        }

        const buffers = []
        for await (const chunk of req) {
          buffers.push(chunk)
        }
        const body = buffers.length ? Buffer.concat(buffers) : undefined

        const resp = await fetch(`${process.env.BEE_ENDPOINT}${req.url}`, {
          method: req.method,
          body,
          headers: req.headers,
        })
        const data = await resp.arrayBuffer()

        const respHeaders = fixResponseHeaders(req, resp)

        res.writeHead(resp.status, resp.statusText, respHeaders)
        res.end(new Uint8Array(data))
      }
    )

    httpsServer.listen(port, () => {
      console.log(chalk.green(`Bee https proxy started at: https://localhost:${port}`))
    })
  } else {
    throw new Error(
      "Cannot find ssl certificates. To create new certificates check /proxy/sslcert/README.md"
    )
  }
}

function fixResponseHeaders(req, res) {
  const origin = (req.headers.referer || process.env.VITE_APP_PUBLIC_URL).replace(/\/$/, "")
  const respHeaders = {
    ...(res ? res.headers.raw() : {}),
    "access-control-allow-origin": [origin],
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": [req.headers["access-control-request-headers"] || "*"],
    "access-control-allow-methods": [req.headers["access-control-request-method"] || "*"],
  }
  delete respHeaders["content-encoding"]
  delete respHeaders["content-length"]
  return respHeaders
}
