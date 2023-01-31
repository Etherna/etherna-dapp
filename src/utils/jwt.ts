import type { User } from "oidc-client-ts"

export const getStorakeKey = () => {
  return `oidc.user:${import.meta.env.VITE_APP_SSO_URL}:ethernaDappClientId`
}

export const getUser = (): User | null => {
  const data = localStorage.getItem(getStorakeKey())
  if (data) {
    return JSON.parse(data)
  }
  return null
}

export const getAccessToken = (): string | undefined => {
  return getUser()?.access_token
}
