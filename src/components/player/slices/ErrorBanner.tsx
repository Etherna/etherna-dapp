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
 *
 */

import React, { useCallback, useEffect, useState } from "react"

import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { ReactComponent as CreditErrorIcon } from "@/assets/icons/credit-error.svg"

import usePlayerStore from "@/stores/player"
import { cn } from "@/utils/classnames"

const ErrorBanner: React.FC = () => {
  const [description, setDescription] = useState("")
  const error = usePlayerStore(state => state.error)

  useEffect(() => {
    if (error) {
      switch (error.code) {
        case 401:
          setDescription(
            "This is a pay to watch video. To watch this content you need to signin and have some credit available."
          )
          break
        case 402:
          setDescription(
            "You don't have enough credit. Please add some more to enjoin this content."
          )
          break
        case 403:
          setDescription("You don't have permission to access this resource.")
          break
        default:
          setDescription(error.message)
          break
      }
    }
  }, [error])

  const ErrorIcon = useCallback(() => {
    switch (error!.code) {
      case 401:
        return <LockClosedIcon />
      case 402:
        return <CreditErrorIcon />
      case 403:
        return <LockClosedIcon />
      default:
        return <ExclamationCircleIcon />
    }
  }, [error])

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center bg-gray-900/80 p-3"
      data-component="player-error-banner"
    >
      <div
        className={cn("mx-auto w-8 text-gray-50 md:w-12 lg:w-16", {
          "text-red-500": error?.code === 500,
          "text-orange-400": error?.code === 402,
        })}
      >
        <ErrorIcon aria-hidden />
      </div>
      <div className="py-6 text-center text-lg font-semibold text-white md:text-xl lg:text-3xl">
        {description}
      </div>
    </div>
  )
}

export default ErrorBanner
