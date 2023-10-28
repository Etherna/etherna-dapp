import type { Matomo } from "./types"

declare global {
  interface Window {
    Matomo?: Matomo
    _paq?: [string, ...any[]][]
  }
}
