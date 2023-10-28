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
  const shouldAppendToken = url.searchParams.has("appendToken") && !!self.accessToken && !event.request.headers.has("Authorization")

  url.searchParams.delete("appendToken")

  let request = event.request

  if (shouldAppendToken && isValidOrigin) {
    request = new Request(url, {
      ...event.request,
      mode: "cors",
      headers: {
        ...Object.fromEntries(event.request.headers.entries()),
        "Authorization": self.accessToken ? `Bearer ${self.accessToken}` : undefined,
      }
    })
  }
  if (url.pathname === "/matomo.js" && isValidOrigin) {
    request = new Request(url, {
      ...event.request,
      mode: "no-cors",
    })
  }

  event.respondWith(
    fetch(request).then((response) => {
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
