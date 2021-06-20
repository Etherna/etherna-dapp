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

const fetch = require("node-fetch").default
const { Response } = require("node-fetch")
const { createProxyMiddleware } = require("http-proxy-middleware")

require("../utils/env")

const FilterTransformStream = require("../classes/FilterTransformStream")


// Consts
const GatewayValidPathsRegex = /^\/(bytes|chunks|files|dirs|tags|pin|soc|feeds|pss)\/?.*/
const MaxBodySizeCap = 5000000 //5MB
const ValidatorHost = process.env.GATEWAY_VALIDATOR_PROXY_HOST
const SwarmHost = process.env.GATEWAY_SWARM_PROXY_HOST


// Middleware
module.exports.SwarmMiddleware = createProxyMiddleware(
  (pathname, req) => {
    return GatewayValidPathsRegex.test(pathname)
  },
  {
    target: SwarmHost,
    changeOrigin: true,
    secure: false,
    logLevel: "info" && "warn" && "error",
    selfHandleResponse: true,
    onProxyReq: handleRequest
  }
)


/**
 * Fetch and return the request body
 * @param {import("http").ClientRequest} proxyReq
 * @param {import("http-proxy-middleware/dist/types").Request} req
 * @param {import("http-proxy-middleware/dist/types").Response} res
 */
async function handleRequest(proxyReq, req, res) {
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
 * @param {import("http-proxy-middleware/dist/types").Request} req
 * @param {import("http-proxy-middleware/dist/types").Response} res
 */
async function handleValidatorRequest(req, res) {
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
  const validationData = await validatorResponse.json()

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
 * @param {Promise<import("node-fetch").Response>} gatewayResponsePromise
 * @param {{id: string, maxBodySize: number, result: string}} validationData
 */
async function limitGatewayResponse(gatewayResponsePromise, validationData) {
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
      if (response.headers.has("Content-Length") && parseInt(response.headers.get("Content-Length"), 10) > maxBodySize) {
        response.headers.set("Content-Length", maxBodySize)
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
* @param {string} requestId
* @param {number} bodySize
* @param {string} secret
*/
async function notifyEndOfLimitedRequest(requestId, bodySize, secret) {
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
 * @param {import("http-proxy-middleware/dist/types").Request} request
 */
async function forwardRequestToGateway(request) {
  // Strip cookies.
  const headers = { ...request.headers }
  headers.host = SwarmHost.replace(/^https?:\/\//, "")
  delete headers.cookie

  const options = parseFetchOptions(headers, request.method, request.body)
  options.compress = false

  return await fetch(SwarmHost + request.url, options)
}

/**
 * Build forward request to validator as a reverse proxy.
 * @param {import("http-proxy-middleware/dist/types").Request} request
 * @param {boolean} forceHttps
 */
async function forwardRequestToValidator(request, forceHttps) {
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
 * @param {import("node-fetch").HeadersInit} headers
 * @param {string} method
 * @param {import("node-fetch").BodyInit} body
 */
const parseFetchOptions = (headers, method, body) => {
  /** @type {import("node-fetch").RequestInit} */
  const options = {
    headers,
    body,
    method: method,
  }

  if (["GET", "HEAD"].includes(method.toUpperCase())) {
    delete options.body
  }

  return options
}
