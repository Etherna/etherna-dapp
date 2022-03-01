import type { IncomingMessage } from "http"

export default async function parseBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const buffers = []
  for await (const chunk of req) {
    buffers.push(chunk)
  }
  return buffers.length ? Buffer.concat(buffers) : undefined
}
