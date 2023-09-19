export const registerSW = (
  url: string,
  registerCallback?: (registration: ServiceWorkerRegistration) => void
) => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(url)
      .then(registration => {
        console.debug("Service worker registered")
        registration.addEventListener("updatefound", function () {
          console.debug("New service worker version found")
          // Update found, register the new service worker
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", function () {
            // New service worker installed and activated, reload the page
            if (newWorker.state === "activated") {
              console.info(`Service worker udpate. Refresh the page.`)
              // location.reload();
            }
          })

          // Force the update by calling update()
          registration.update()
        })

        registerCallback?.(registration)
      })
      .catch(error => console.error("Error registering service worker:", error))
  }
}
