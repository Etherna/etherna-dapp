import type { IncomingMessage } from "http"
import type { Response } from "node-fetch"

export default function fixResponseHeaders(
  req: IncomingMessage,
  response: Response
): Record<string, string | string[]> {
  const origin = (req.headers.referer || "https://localhost:3000").replace(/\/$/, "")
  const respHeaders: Record<string, string | string[]> = {
    ...response.headers.raw(),
    "access-control-allow-credentials": ["true"],
    "access-control-allow-origin": [origin],
    "access-control-allow-headers": [req.headers["access-control-request-headers"] || "*"],
    "access-control-allow-methods": [req.headers["access-control-request-method"] || "*"],
  }
  delete respHeaders["content-encoding"]
  delete respHeaders["content-length"]

  return respHeaders
}
