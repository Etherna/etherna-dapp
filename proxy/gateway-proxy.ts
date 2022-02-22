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
import path from "path"
import express from "express"
import https from "https"
import cors from "cors"

import "./utils/env.js"
import ValidatorMiddleware from "./middlewares/validator-middleware.js"
import BeeMiddleware from "./middlewares/bee-middleware.js"
import BeeDebugMiddleware from "./middlewares/bee-debug-middleware.js"

/**
 * Setup node server
 */
const app = express()
const port = process.env.GATEWAY_PORT || 44362

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.raw({
  type: "*/*",
  limit: "100mb"
}))
app.use(
  cors({
    credentials: true,
    origin: true
  })
)
app.use(ValidatorMiddleware)
app.use(BeeMiddleware)
app.use(BeeDebugMiddleware)

const PrivateKeyPath = path.resolve("..", process.env.SSL_KEY_FILE)
const CertificatePath = path.resolve("..", process.env.SSL_CRT_FILE)

if (fs.existsSync(PrivateKeyPath) && fs.existsSync(CertificatePath)) {
  const privateKey = fs.readFileSync(PrivateKeyPath)
  const certificate = fs.readFileSync(CertificatePath)

  const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app)

  // Proxy gateway validator/bee
  httpsServer.listen(port, () => {
    console.log(`Proxy started at: https://localhost:${port}`)
  })
} else {
  app.listen(port, () => {
    console.log(`Proxy started at: http://localhost:${port}`)
  })
}

process.setMaxListeners(0)
