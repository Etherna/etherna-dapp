self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim())
})

// Intercept network requests and modify headers
self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url)

  const isValidOrigin = self.allowedOrigins && self.allowedOrigins.includes(url.origin)
  const shouldAppendToken = url.searchParams.has("appendToken") && !!self.accessToken

  url.searchParams.delete("appendToken")

  const newRequest = shouldAppendToken && isValidOrigin
    ? new Request(url, {
      ...event.request,
      mode: "cors",
      headers: {
        ...event.request.headers,
        "Authorization": self.accessToken ? `Bearer ${self.accessToken}` : undefined,
      }
    })
    : event.request

  event.respondWith(
    fetch(newRequest).then((response) => {
      return response
    }).catch((error) => {
      console.warn(`SW fetch error for '${url}': ${error}`)
      // If the fetch fails, try to respond with a cached response
      throw error
    })
  )
})

self.addEventListener("message", function (event) {
  var data = JSON.parse(event.data)

  if (data.accessToken) {
    self.accessToken = data.accessToken
  }
  if (data.allowedOrigins) {
    self.allowedOrigins = data.allowedOrigins
  }
})
