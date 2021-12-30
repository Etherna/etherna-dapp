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
import { createProxyMiddleware } from "http-proxy-middleware"
import { Request as ProxyRequest, Response as ProxyResponse } from "http-proxy-middleware/dist/types"
import { ClientRequest, IncomingHttpHeaders } from "http"
import fetch, { Response, RequestInit, BodyInit } from "node-fetch"

import "../utils/env.js"
import { unzipJSON } from "../utils/unzip.js"
import FilterTransformStream from "../classes/FilterTransformStream.js"
import type { ValidationResponse } from "./validator"

// Consts
const GatewayValidPathsRegex = /^\/(bytes|chunks|bzz|tags|pins|soc|feeds|pss|stamps)\/?.*/
const MaxBodySizeCap = 5000000 //5MB
const ValidatorHost = process.env.GATEWAY_VALIDATOR_PROXY_HOST
const SwarmHost = process.env.GATEWAY_SWARM_PROXY_HOST
const SeedDataFolder = path.resolve(process.env.OLDPWD + "/seed")

// Middleware
const SwarmMiddleware = createProxyMiddleware(
  pathname => {
    return GatewayValidPathsRegex.test(pathname)
  },
  {
    target: SwarmHost,
    changeOrigin: true,
    secure: false,
    logLevel: "error",
    selfHandleResponse: true,
    onProxyReq: handleRequest as any
  }
)


/**
 * Fetch and return the request body
 */
async function handleRequest(proxyReq: ClientRequest, req: ProxyRequest, res: ProxyResponse) {
  // Wrap your script in a try/catch and return the error stack to view error information.
  try {
    const response = await handleValidatorRequest(req, res)

    // Return error message
    if (typeof response.body.pipe !== "function") {
      res.status(response.status).send(await response.text())
      return
    }

    // Return response
    response.headers.forEach((value, name) => {
      res.setHeader(name, value)
    })
    response.body.pipe(res.status(response.status))
  } catch (e) {
    console.error(e)
    res.status(500).send(e)
  }
}

/**
 * Validate and handle requests for gateway resources.
 */
async function handleValidatorRequest(req: ProxyRequest, res: ProxyResponse) {
  // Run requests.
  const gatewayResponsePromise = forwardRequestToGateway(req) //start async request to gateway

  // Check if request should not be validated
  const disableRequestValidation = process.env.DISABLE_REQUEST_VALIDATION === "true" || req.method !== "GET"

  if (disableRequestValidation) {
    return await gatewayResponsePromise
  }

  // FIXME:
  // Gateway filter validator is yet to be updated to the new
  // bee api.
  // So we must return the un-filtered response in the meantime.
  return await gatewayResponsePromise

  // Get Validator response.
  const validatorResponse = await forwardRequestToValidator(req) //get response from validator

  // Verify validator response.
  if (validatorResponse.status !== 200) {
    const msg = `Invalid response from validator ${validatorResponse.status}: ${validatorResponse.statusText}`
    return new Response(msg, { status: validatorResponse.status })
  }

  // Decode data from validator response.
  const validationData = await validatorResponse.json() as ValidationResponse

  // Elaborate result.
  switch (validationData.result) {
    case "AllowFree": //execute free request on gateway, as is
      return await gatewayResponsePromise

    case "DenyForbidden": //403 error code: Forbidden
      return new Response("Forbidden request", { status: 403 })

    case "DenyPaymentRequired": //402 error code: Payment Required
      return new Response("Insufficient credit. Please add more", { status: 402 })

    case "DenyUnauthenticated": //401 error code: Unauthorized
      return new Response("Unauthenticated user. Please login", { status: 401 })

    case "Limit": //execute request on gateway, and limit result
      return await limitGatewayResponse(gatewayResponsePromise, validationData)

    default: //not implemented exception
      return new Response("Invalid response from validator", { status: 500 })
  }
}

/**
 * Execute a limited request, validate result, and report to validator consumed data ammount
 */
async function limitGatewayResponse(gatewayResponsePromise: Promise<Response>, validationData: ValidationResponse) {
  const maxBodySize = Math.min(validationData.maxBodySize, MaxBodySizeCap) //put an hard cap on body size
  const requestId = validationData.id
  const requestSecret = validationData.secret

  // Elaborate response.
  return gatewayResponsePromise.then((response) => {
    let streamedBytes = 0

    // Don't limit if response is not ok (out of range [200,299]).
    if (!response.ok) {
      return response
    }

    // Verify and fix headers. This MUST be done before to start stream.
    //Content-Range
    let isPartialResponse = false
    if (response.headers.has("Content-Range")) {
      isPartialResponse = true

      //fix range-end value
      const rangeHeader = response.headers.get("Content-Range")
      const groups = rangeHeader.match(/^bytes ((\d+)-(\d+)|\*)\/(\d+|\*)$/)

      if (groups[1] !== "*" && parseInt(groups[3], 10) - parseInt(groups[2], 10) > maxBodySize) {
        const newRangeHeader = "bytes " + groups[2] + "-" + (parseInt(groups[2], 10) + maxBodySize) + "/" + groups[4]
        response.headers.set("Content-Range", newRangeHeader)
      }

      //Content-Length. Fix it only if there is also content-range header
      const contentLength = response.headers.has("Content-Length")
        ? parseInt(response.headers.get("Content-Length"), 10)
        : null
      if (contentLength > maxBodySize) {
        response.headers.set("Content-Length", `${maxBodySize}`)
      }
    }

    // Process body stream.
    const reader = response.body
    const retStream = new FilterTransformStream(maxBodySize)

    reader.on("close", async () => {
      await notifyEndOfLimitedRequest(requestId, streamedBytes, requestSecret)
    })

    return new Response(reader.pipe(retStream), {
      headers: response.headers,
      status: isPartialResponse ? 206 : 200
    })
  })
}

/**
* Notify validator that a stream is ended with a given transfered data.
*/
async function notifyEndOfLimitedRequest(requestId: string, bodySize: number, secret: string) {
  const closeEndpoint = ValidatorHost + "/api/v0.2/interceptor/request/close"

  const method = "PUT"
  const headers = {
    "Content-Type": "application/json"
  }
  const body = JSON.stringify({
    id: requestId,
    bodySize: bodySize,
    secret: secret
  })
  const options = parseFetchOptions(headers, method, body)

  return await fetch(closeEndpoint, options)
}

/**
 * Build forward request to gateway as a reverse proxy.
 */
async function forwardRequestToGateway(request: ProxyRequest) {
  // Strip cookies.
  const headers = { ...request.headers }
  headers.host = SwarmHost.replace(/^https?:\/\//, "")
  delete headers.cookie

  const options = parseFetchOptions(headers, request.method, request.body)
  options.compress = false

  if (request.method === "POST" && /^\/(soc|bzz|feeds)/.test(request.path) && process.env.BEE_SEED_ENABLED === "true") {
    return await saveSeedData(request, await fetch(SwarmHost + request.url, options))
  }
  return await fetch(SwarmHost + request.url, options)
}

/**
 * Save seed data locally
 * @param req Proxy request
 * @param res Fetch response
 */
async function saveSeedData(req: ProxyRequest, res: Response) {
  // create folders 
  if (!fs.existsSync(SeedDataFolder)) fs.mkdirSync(SeedDataFolder)
  if (!fs.existsSync(SeedDataFolder + "/data")) fs.mkdirSync(SeedDataFolder + "/data")

  const data = await res.clone().arrayBuffer()
  const respJson = await unzipJSON<{ reference: string }>(data)
  const reference = respJson.reference

  if (!reference) return

  type RequestsLog = {
    v: number
    items: Array<{
      path: string
      search?: string
      contentType: string | null
      dataId?: string
    }>
  }

  const requests: RequestsLog = fs.existsSync(SeedDataFolder + "/requests.json")
    ? JSON.parse(fs.readFileSync(SeedDataFolder + "/requests.json").toString())
    : { v: 1, items: [] }

  const dataId = Buffer.isBuffer(req.body) ? reference : undefined
  const exists = requests.items.find(item => item.path === req.path && item.dataId === dataId)

  if (!exists) {
    requests.items.push({
      path: req.path,
      search: new URL(req.url, "http://dummy.test").search,
      contentType: req.headers["content-type"] || null,
      dataId,
    })

    fs.writeFileSync(SeedDataFolder + "/requests.json", JSON.stringify(requests))
    if (Buffer.isBuffer(req.body)) {
      fs.writeFileSync(SeedDataFolder + "/data/" + reference, req.body)
    }
  }

  return res
}

/**
 * Build forward request to validator as a reverse proxy.
 */
async function forwardRequestToValidator(request: ProxyRequest, forceHttps = false) {
  // Create new url.
  const newRequestUrl = new URL(ValidatorHost + request.url)

  if (forceHttps) {
    newRequestUrl.protocol = "https:"
  }

  const host = ValidatorHost.replace(/^https?:\/\//, "")

  // Create new headers.
  const headers = { ...request.headers }
  headers.host = host
  headers["X-Forwarded-Host"] = host

  const options = parseFetchOptions(headers, request.method, request.body)

  return await fetch(newRequestUrl.toString(), options)
}

/**
 * Parse the options for a fetch request
 */
const parseFetchOptions = (headers: IncomingHttpHeaders, method: string, body: BodyInit) => {
  const options: RequestInit = {
    headers: headers as HeadersInit,
    body,
    method: method,
  }

  if (["GET", "HEAD"].includes(method.toUpperCase())) {
    delete options.body
  }

  return options
}

export default SwarmMiddleware
