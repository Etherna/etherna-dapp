import fetch from "node-fetch"
import { Response } from "node-fetch"
import type { IncomingMessage } from "http"

import saveSeedData from "./save-seed-data.js"
import parseBody from "../utils/parse-body.js"

export default async function defaultProxyResponse(req: IncomingMessage, proxyHost: string): Promise<Response> {
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
