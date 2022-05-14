/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
