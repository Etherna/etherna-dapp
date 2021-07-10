import React, { useEffect, useState } from "react"
import classnames from "classnames"

import "./player-error-banner.scss"
import { ReactComponent as CreditErrorIcon } from "@svg/icons/credit-error-icon.svg"
import { ReactComponent as ServerErrorIcon } from "@svg/icons/server-error-icon.svg"
import { ReactComponent as UnauthorizedIcon } from "@svg/icons/unauthorized-error-icon.svg"

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
      case 401: return <UnauthorizedIcon />
      case 402: return <CreditErrorIcon />
      case 403: return <UnauthorizedIcon />
      default: return <ServerErrorIcon />
    }
  }

  return (
    <div className="player-error-banner">
      <div className={classnames("error-icon", {
        "warning": error?.code === 402,
        "danger": error?.code === 500,
      })}>
        <ErrorIcon />
      </div>
      <div className="error-description">{description}</div>
    </div>
  )
}

export default PlayerErrorBanner
