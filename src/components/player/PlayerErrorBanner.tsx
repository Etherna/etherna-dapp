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

import React, { useEffect, useState } from "react"
import classNames from "classnames"

import classes from "@styles/components/player/PlayerErrorBanner.module.scss"
import { ExclamationCircleIcon } from "@heroicons/react/outline"
import { LockClosedIcon } from "@heroicons/react/solid"
import { ReactComponent as CreditErrorIcon } from "@assets/icons/credit-error.svg"

import { usePlayerState } from "@context/player-context/hooks"

const PlayerErrorBanner = () => {
  const [description, setDescription] = useState("")
  const [state] = usePlayerState()
  const { error } = state

  useEffect(() => {
    if (error) {
      switch (error.code) {
        case 401:
          setDescription("You are not authenticated. Please Sign in.")
          break
        case 402:
          setDescription("You don't have enough credit. Please add some more to enjoin this content.")
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

  const ErrorIcon = () => {
    switch (error!.code) {
      case 401: return <LockClosedIcon />
      case 402: return <CreditErrorIcon />
      case 403: return <LockClosedIcon />
      default: return <ExclamationCircleIcon />
    }
  }

  return (
    <div className={classes.playerErrorBanner}>
      <div className={classNames(classes.errorIcon, {
        [classes.warning]: error?.code === 402,
        [classes.danger]: error?.code === 500,
      })}>
        <ErrorIcon />
      </div>
      <div className={classes.errorDescription}>{description}</div>
    </div>
  )
}

export default PlayerErrorBanner
