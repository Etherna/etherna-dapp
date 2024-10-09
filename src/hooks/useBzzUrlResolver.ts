import useClientsStore from "@/stores/clients"
import { withAccessToken } from "@/utils/jwt"

import type { Reference } from "@etherna/sdk-js/clients"

export function useBzzUrlResolver({ appendToken }: { appendToken?: boolean } = {}) {
  const bee = useClientsStore(state => state.beeClient)

  return function resolveUrl(reference: Reference, path: string) {
    const fixedPath = path
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .replace(new RegExp(`^${reference}/?`), "")
    const url = [bee.url, "bzz", reference, fixedPath].filter(Boolean).join("/")
    return appendToken ? withAccessToken(url) : url
  }
}
