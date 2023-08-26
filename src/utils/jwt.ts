import type { User } from "oidc-client-ts"

export const getStorakeKey = () => {
  return `oidc.user:${import.meta.env.VITE_APP_SSO_URL}:ethernaDappClientId`
}

export const getUser = (): User | null => {
  const data = localStorage.getItem(getStorakeKey())
  if (data) {
    return JSON.parse(data) as User
  }
  return null
}

export const getAccessToken = (): string | undefined => {
  return getUser()?.access_token
}

/**
 * Add custom url param to tell the fetch-sw to add the access token to the request
 * @param url resource url
 */
export const withAccessToken = (url: string) => {
  const urlObj = new URL(url)
  urlObj.searchParams.set("appendToken", "true")
  return urlObj.toString()
}
