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
import { Dispatch } from "redux"

import { UIActions, UIActionTypes } from "@/state/reducers/uiReducer"

let waitingInterval: number | undefined
let waitingStatus: boolean | undefined

export default function useConfirmation() {
  const dispatch = useDispatch<Dispatch<UIActions>>()

  const showConfirmation = (title: string, message: string) => {
    waitingStatus = undefined

    dispatch({
      type: UIActionTypes.TOGGLE_CONFIRMATION,
      confirmMessage: message,
      confirmTitle: title
    })
  }

  const hideConfirmation = (success = true) => {
    dispatch({
      type: UIActionTypes.TOGGLE_CONFIRMATION
    })

    waitingStatus = success
  }

  const waitConfirmation = async (
    title: string, message: string, confirmTitle?: string, confirmType?: "default" | "destructive"
  ) => {
    dispatch({
      type: UIActionTypes.TOGGLE_CONFIRMATION,
      confirmMessage: message,
      confirmTitle: title,
      confirmButtonTitle: confirmTitle,
      confirmButtonType: confirmType
    })

    clearInterval(waitingInterval)

    return new Promise<boolean>((resolve) => {
      waitingInterval = window.setInterval(() => {
        const confirmationSuccess = waitingStatus

        if (confirmationSuccess !== undefined) {
          dispatch({
            type: UIActionTypes.TOGGLE_CONFIRMATION
          })

          clearInterval(waitingInterval)

          waitingStatus = undefined
          waitingInterval = undefined

          resolve(confirmationSuccess)
        }
      }, 500)
    })
  }

  return {
    showConfirmation,
    hideConfirmation,
    waitConfirmation
  }
}
