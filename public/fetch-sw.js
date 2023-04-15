self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim())
})

// Intercept network requests and modify headers
self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url)
  const searchParams = new URLSearchParams(url.search)

  const shouldAppendToken = searchParams.has("appendToken") && self.accessToken

  const newRequest = shouldAppendToken
    ? new Request(event.request, {
      mode: "cors",
      headers: {
        ...event.request.headers,
        "Authorization": `Bearer ${self.accessToken}`
      }
    })
    : event.request

  event.respondWith(
    fetch(newRequest).then((response) => {
      // Respond to the original request with the fetched response
      return response
    }).catch(() => {
      // If the fetch fails, try to respond with a cached response
      return caches.match(newRequest)
    })
  )
})

self.addEventListener("message", function (event) {
  var data = JSON.parse(event.data)

  // console.debug("SW Received Message:", data)

  self.accessToken = data.accessToken
})
