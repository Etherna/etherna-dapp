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

import useUIStore from "@/stores/ui"

let resolveConfirmation: ((success: boolean) => void) | undefined

export default function useConfirmation() {
  const showConfirmation = useUIStore(state => state.showConfirmation)
  const hide = useUIStore(state => state.hideConfirmation)

  const hideConfirmation = useCallback(
    (success = true) => {
      hide()
      resolveConfirmation?.(success)
    },
    [hide]
  )

  const waitConfirmation = useCallback(
    async (
      title: string,
      message: string,
      confirmTitle?: string,
      confirmType?: "default" | "destructive"
    ) => {
      showConfirmation(title, message, confirmTitle, confirmType)

      return new Promise<boolean>(resolve => {
        resolveConfirmation = resolve
      })
    },
    [showConfirmation]
  )

  return {
    showConfirmation,
    hideConfirmation,
    waitConfirmation,
  }
}
