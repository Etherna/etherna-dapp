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

const fs = require("fs")
const https = require("https")
const express = require("express")
const cors = require("cors")
const { json, raw, urlencoded } = require("body-parser")

const { ValidatorMiddleware } = require("./middlewares/validator-middleware")
const { SwarmMiddleware } = require("./middlewares/swarm-middleware")

require("./utils/env")

/**
 * Setup node server
 */
const app = express()
const port = process.env.GATEWAY_PORT || 44362

app.use(json())
app.use(urlencoded({ extended: true }))
app.use(raw({
  type: "*/*",
  limit: "100mb"
}))
app.use(
  cors({
    credentials: true,
    origin: true
  })
)
app.use(SwarmMiddleware)
app.use(ValidatorMiddleware)

const PrivateKeyPath = process.env.SSL_KEY_FILE
const CertificatePath = process.env.SSL_CRT_FILE

if (fs.existsSync(PrivateKeyPath) && fs.existsSync(CertificatePath)) {
  const privateKey = fs.readFileSync(PrivateKeyPath, "utf8")
  const certificate = fs.readFileSync(CertificatePath, "utf8")

  const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app)
  httpsServer.listen(port)
} else {
  app.listen(port)
}

process.setMaxListeners(0)
