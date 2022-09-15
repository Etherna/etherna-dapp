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

import { useDispatch } from "react-redux"
import type { Dispatch } from "redux"

import type { UIActions } from "@/state/reducers/uiReducer"
import { UIActionTypes } from "@/state/reducers/uiReducer"
import useSelector from "@/state/useSelector"

let resolveAuthentication: ((success: boolean) => void) | undefined

export default function useBeeAuthentication() {
  const beeClient = useSelector(state => state.env.beeClient)
  const dispatch = useDispatch<Dispatch<UIActions>>()

  function showAuth() {
    dispatch({
      type: UIActionTypes.TOGGLE_BEE_AUTH,
      showBeeAuthentication: true,
    })
  }

  function hideAuth(success = true) {
    dispatch({
      type: UIActionTypes.TOGGLE_BEE_AUTH,
      showBeeAuthentication: false,
    })

    resolveAuthentication?.(success)
  }

  async function waitAuth() {
    if (beeClient.auth.isAuthenticated) return true
    if (beeClient.auth.token) {
      if (await beeClient.auth.refreshToken(beeClient.auth.token)) {
        return true
      }
    }

    dispatch({
      type: UIActionTypes.TOGGLE_BEE_AUTH,
      showBeeAuthentication: true,
    })

    return new Promise<boolean>(resolve => {
      resolveAuthentication = resolve
    })
  }

  return {
    showAuth,
    hideAuth,
    waitAuth,
  }
}