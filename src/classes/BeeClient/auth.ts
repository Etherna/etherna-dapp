import cookie from "cookiejs"

import type BeeClient from "."
import type { AuthenticationOptions, RequestOptions } from "./types"
import { stringToBase64 } from "@/utils/buffer"

const authEndpoint = "/auth"
const authRefreshEndpoint = "/refresh"
const TOKEN_COOKIE_NAME = "bee-auth-token"
const TOKEN_EXPIRATION_SETTING = "bee-auth-token-expiration"

let memoryToken: string | null = null

export default class Auth {
  constructor(private instance: BeeClient) {}

  public get token(): string | null {
    if (typeof window === "undefined") return memoryToken

    const token = cookie.get(TOKEN_COOKIE_NAME) as string | null
    return token
  }

  public get tokenExpiration(): Date | null {
    if (typeof window === "undefined") return null

    const tokenExpiration = localStorage.getItem(TOKEN_EXPIRATION_SETTING)

    return tokenExpiration ? new Date(+tokenExpiration) : null
  }

  public get isAuthenticated(): boolean {
    if (typeof window === "undefined") return false

    const token = this.token
    const tokenExpiration = this.tokenExpiration?.getTime() ?? Date.now()

    return !!token && tokenExpiration > Date.now()
  }

  /**
   * Authenticate with the Bee node
   *
   * @param username Bee node admin username (by default empty)
   * @param password Bee node admin password
   */
  async authenticate(
    username: string,
    password: string,
    options?: AuthenticationOptions
  ): Promise<string> {
    let token = this.token
    const expirationDate = this.tokenExpiration ?? new Date()

    if (token && expirationDate <= new Date()) {
      token = await this.refreshToken(token)
    }

    const expiration = options?.expiry || 3600 * 24 // 1 day

    if (!token) {
      const credentials = stringToBase64(`${username}:${password}`)

      const data = {
        role: options?.role || "maintainer",
        expiry: expiration,
      }

      const resp = await this.instance.request.post<{ key: string }>(`${authEndpoint}`, data, {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        timeout: options?.timeout,
        signal: options?.signal,
      })

      token = resp.data.key
    }

    this.saveToken(token, expiration)

    return token
  }

  async refreshToken(token: string, options?: RequestOptions): Promise<string | null> {
    try {
      const resp = await this.instance.request.post<{ key: string }>(
        `${authRefreshEndpoint}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: options?.timeout,
          signal: options?.signal,
        }
      )
      const newToken = resp.data.key

      this.saveToken(newToken)

      return newToken
    } catch (error: any) {
      console.error(error.response)
      // cookie.remove(TOKEN_COOKIE_NAME)
      return null
    }
  }

  // Utils

  private saveToken(token: string | null, expiry = 3600 * 24) {
    if (typeof window === "undefined") {
      memoryToken = token
      return
    }

    if (!token) {
      // cookie.remove(TOKEN_COOKIE_NAME)
      // localStorage.removeItem(TOKEN_EXPIRATION_SETTING)
    } else {
      const expiration = new Date(Date.now() + expiry * 1000)

      const cookieExpiration = new Date()
      cookieExpiration.setFullYear(cookieExpiration.getFullYear() + 10)

      localStorage.setItem(TOKEN_EXPIRATION_SETTING, expiration.getTime().toString())
      cookie.set(TOKEN_COOKIE_NAME, token!, {
        sameSite: "Strict",
        expires: expiration.toISOString(),
        secure: true,
      })
    }
  }
}
