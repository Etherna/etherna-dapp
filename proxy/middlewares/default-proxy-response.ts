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

/* eslint-disable no-restricted-imports */
import fetch, { Response } from "node-fetch"

import parseBody from "../utils/parse-body.js"
import saveSeedData from "./save-seed-data.js"

import type { IncomingMessage } from "http"

export default async function defaultProxyResponse(
  req: IncomingMessage,
  proxyHost: string
): Promise<Response> {
  const headers = req.headers as Record<string, string>
  const body = await parseBody(req)

  try {
    const response = await fetch(`${proxyHost}${req.url}`, {
      method: req.method,
      body,
      headers,
    })

    await saveSeedData(req, body, response)

    return response
  } catch (error) {
    console.log("PROXY REQUEST ERROR", error.message)

    return new Response(error.message, { status: 500 })
  }
}
