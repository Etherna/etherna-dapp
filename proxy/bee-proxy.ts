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
import { createProxyMiddleware } from "http-proxy-middleware"

const port = process.env.BEE_DEBUG_PORT || 1636

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  credentials: true,
  origin: true
}))
app.use(createProxyMiddleware(
  {
    target: process.env.BEE_DEBUG_ENDPOINT,
    secure: false,
    logLevel: "error"
  }
))

const PrivateKeyPath = path.resolve("..", process.env.SSL_KEY_FILE)
const CertificatePath = path.resolve("..", process.env.SSL_CRT_FILE)

if (fs.existsSync(PrivateKeyPath) && fs.existsSync(CertificatePath)) {
  const privateKey = fs.readFileSync(PrivateKeyPath)
  const certificate = fs.readFileSync(CertificatePath)

  const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app)
  httpsServer.listen(port, () => {
    console.log(`Bee Debug Proxy started at: https://localhost:${port}`)
  })
} else {
  throw new Error("You need a certificate to run this proxy")
}
