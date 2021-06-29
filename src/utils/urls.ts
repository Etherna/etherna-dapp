export const safeURL = (url: string | null | undefined, path?: string) => {
  try {
    let baseUrl = (url ?? "")
    if (!/https?:\/\//.test(baseUrl)) {
      baseUrl = `https://${baseUrl}`
    }
    return new URL(path ?? "", baseUrl)
  } catch (error) {
    return null
  }
}

export const urlOrigin = (baseUrl: string) => {
  return safeURL(baseUrl)?.origin
}

export const urlHostname = (baseUrl: string) => {
  return safeURL(baseUrl)?.hostname
}

export const urlPath = (baseUrl: string, path?: string) => {
  return safeURL(baseUrl, path)?.href
}
