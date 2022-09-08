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

import type { IncomingMessage } from "http"
import { Response } from "node-fetch"

import FilterTransformStream from "../classes/FilterTransformStream.js"
import type { ValidationResponse } from "../typings/validator"
import defaultProxyResponse from "./default-proxy-response.js"

/**
 * Validated bee response
 *
 * @param req Incoming request
 * @param validatorProxyHost Host of the validator
 * @param beeProxyHost Host the bee instance
 * @returns Validated response
 */
export default async function beeValidatorResponse(
  req: IncomingMessage,
  validatorProxyHost: string,
  beeProxyHost: string
): Promise<Response> {
  // Initiate request.
  const defaultResponse = defaultProxyResponse(req, beeProxyHost)

  // Exit any non GET requests
  if (req.method !== "GET") {
    return await defaultResponse
  }

  // Get Validator response.
  const validatorResponse = await defaultProxyResponse(req, validatorProxyHost)

  // Verify validator response.
  if (validatorResponse.status !== 200) {
    const msg = `Invalid response from validator ${validatorResponse.status}: ${validatorResponse.statusText}`
    return new Response(msg, { status: validatorResponse.status })
  }

  // Decode data from validator response.
  const validationData = (await validatorResponse.json()) as ValidationResponse

  console.log(validationData)

  // Elaborate result.
  switch (validationData.result) {
    case "AllowFree": //execute free request on gateway, as is
      return await defaultResponse
    case "AllowPayed": //execute free request on gateway, as is
      return await defaultResponse
    case "DenyForbidden": //403 error code: Forbidden
      return new Response("Forbidden request", { status: 403 })
    case "DenyNotOfferedContent": //403 error code: Forbidden
      return new Response("Content not offered", { status: 402 })
    case "DenyPaymentRequired": //402 error code: Payment Required
      return new Response("Insufficient credit. Please add more", { status: 402 })
    case "DenyUnauthenticated": //401 error code: Unauthorized
      return new Response("Unauthenticated user. Please login", { status: 401 })
    default: //not implemented exception
      return new Response("Invalid response from validator", { status: 500 })
  }
}

/**
 * Execute a limited request, validate result, and report to validator consumed data ammount
 *
 * @param validatorHost Host of the gateway validator
 * @param beeResponsePromise Default bee response promise
 * @param validationData Validation data
 * @returns Validated response
 */
async function limitGatewayResponse(
  validatorHost: string,
  beeResponsePromise: Promise<Response>,
  validationData: ValidationResponse
) {
  const maxBodySize = Math.min(validationData.maxBodySize, 5000000) //put an hard cap on body size (5MB)
  const requestId = validationData.id
  const requestSecret = validationData.secret

  // Elaborate response.
  return beeResponsePromise.then(response => {
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
        const newRangeHeader =
          "bytes " + groups[2] + "-" + (parseInt(groups[2], 10) + maxBodySize) + "/" + groups[4]
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
      await notifyEndOfLimitedRequest(validatorHost, requestId, streamedBytes, requestSecret)
    })

    return new Response(reader.pipe(retStream), {
      headers: response.headers,
      status: isPartialResponse ? 206 : 200,
    })
  })
}

/**
 * Notify validator that a stream is ended with a given transfered data.
 *
 * @param validatorHost Host of the gateway validator
 * @param requestId Id of validator request
 * @param bodySize Streamed bytes size
 * @param secret Validation secret
 * @returns Validator response
 */
async function notifyEndOfLimitedRequest(
  validatorHost: string,
  requestId: string,
  bodySize: number,
  secret: string
) {
  const closeEndpoint =
    validatorHost + `/api/v${process.env.VITE_APP_API_VERSION}/interceptor/request/close`

  return await fetch(closeEndpoint, {
    method: "PUT",
    body: JSON.stringify({
      id: requestId,
      bodySize: bodySize,
      secret: secret,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
}
