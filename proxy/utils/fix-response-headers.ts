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

export default function fixResponseHeaders(
  req: IncomingMessage,
  response: Response | null
): Record<string, string | string[]> {
  const origin = (req.headers.referer || "https://localhost:3000").replace(/\/$/, "")
  const respHeaders: Record<string, string | string[]> = {
    ...Object.fromEntries(response?.headers.entries() ?? []),
    "access-control-allow-credentials": ["true"],
    "access-control-allow-origin": [origin],
    "access-control-allow-headers": [req.headers["access-control-request-headers"] || "*"],
    "access-control-allow-methods": [req.headers["access-control-request-method"] || "*"],
  }
  delete respHeaders["content-encoding"]
  delete respHeaders["content-length"]

  return respHeaders
}
new Response(null, {
  status: 200,
  headers: {
    test: "ciao",
  },
})
