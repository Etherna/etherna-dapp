import { useEffect } from "react"

import { useConfirmation } from "@state/hooks/ui"

const useAppUpdate = () => {
  const { waitConfirmation } = useConfirmation()

  useEffect(() => {
    window.addEventListener("pwaupdate", handleUpdate)
    return () => {
      window.removeEventListener("pwaupdate", handleUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdate = async () => {
    console.info("Updating PWA...")

    const serviceWorkerRegistration = await navigator.serviceWorker.ready
    const waitingServiceWorker = serviceWorkerRegistration.waiting
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", async e => {
        const serviceWorker = e.target as ServiceWorker
        if (serviceWorker?.state === "activated") {
          if (
            await waitConfirmation(
              "App Update",
              "We have updated the app. Do you want to update it now?",
              "Update now"
            )
          ) {
            window.location.reload()
          }
        }
      })
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" })
    }
  }
}

export default useAppUpdate
