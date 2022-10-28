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
import { useCallback } from "react"

import useClientsStore from "@/stores/clients"
import useUIStore from "@/stores/ui"

let resolveAuthentication: ((success: boolean) => void) | undefined

export default function useBeeAuthentication() {
  const beeClient = useClientsStore(state => state.beeClient)
  const showBeeAuthentication = useUIStore(state => state.showBeeAuthentication)
  const hideBeeAuthentication = useUIStore(state => state.hideBeeAuthentication)

  const showAuth = useCallback(() => {
    showBeeAuthentication()
  }, [showBeeAuthentication])

  const hideAuth = useCallback(
    (success = true) => {
      hideBeeAuthentication()
      resolveAuthentication?.(success)
    },
    [hideBeeAuthentication]
  )
  const waitAuth = useCallback(async () => {
    if (beeClient.auth.isAuthenticated) return true

    showBeeAuthentication()

    if (beeClient.auth.token) {
      if (await beeClient.auth.refreshToken(beeClient.auth.token)) {
        return true
      }
    }

    return new Promise<boolean>(resolve => {
      resolveAuthentication = resolve
    })
  }, [beeClient.auth, showBeeAuthentication])

  return {
    showAuth,
    hideAuth,
    waitAuth,
  }
}
