import React, { useEffect, useRef, useState } from "react"
import classnames from "classnames"

import "./extension-panel.scss"
import { ReactComponent as BackIcon } from "@svg/icons/back-icon.svg"

import Button from "@common/Button"
import http from "@utils/request"
import dayjs from "@utils/dayjs"

type ExtensionPanelProps = {
  title: string
  description?: string
  host: string
  defaultHost: string
  apiPath: string
  defaultApiPath: string
  isSignedIn?: boolean
  onSave(hostValue: string, apiPathValue: string): void
  onReset(): void
  onSignin(): void
  onSignout(): void
  onBack(): void
}

const ExtensionPanel = ({
  title,
  description,
  host,
  defaultHost,
  apiPath,
  defaultApiPath,
  isSignedIn,
  onSave,
  onReset,
  onSignin,
  onSignout,
  onBack
}: ExtensionPanelProps) => {
  const hostLastChangeRef = useRef<{ host?: string, lastChange?: dayjs.Dayjs }>({})
  const [hostValue, setHostValue] = useState("")
  const [apiPathValue, setApiPathValue] = useState("")

  useEffect(() => {
    setHostValue(host)
  }, [host])

  useEffect(() => {
    setApiPathValue(apiPath)
  }, [apiPath])

  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const host = e.currentTarget.value
    setHostValue(host)

    if ("lastChange" in hostLastChangeRef.current) {
      hostLastChangeRef.current.host = host
      hostLastChangeRef.current.lastChange = dayjs()
    } else {
      hostLastChangeRef.current.lastChange = dayjs()
      hostLastChangeRef.current.host = host
      updateApiPath()
    }
  }

  const updateApiPath = () => {
    const update = async () => {
      const { lastChange, host } = hostLastChangeRef.current
      if (lastChange && dayjs.duration(dayjs().diff(lastChange)).seconds() < 0.75) {
        setTimeout(() => {
          update()
        }, 250)
      } else {
        try {
          const resp = await http.get(`${host}/swagger/v0.2/swagger.json`)
          const info = resp.data && resp.data.info
          const apiVersion = info && info.version

          setApiPathValue(apiVersion ? `/api/v${apiVersion}` : ``)
          hostLastChangeRef.current = {}
        } catch (error) {
          setApiPathValue("")
          hostLastChangeRef.current = {}
        }
      }
    }
    update()
  }

  return (
    <div className="extension-panel">
      <div className="extension-panel-header">
        <Button aspect="transparent" size="small" action={onBack}>
          <BackIcon />
        </Button>
        <strong>{title}</strong>
      </div>

      <small>{description}</small>

      <div className="extension-panel-group">
        <strong className="flex-1">Host</strong>
        <input type="text" value={hostValue} onChange={handleHostChange} />
      </div>
      <div className="extension-panel-group">
        <strong className="flex-1">Api path</strong>
        <input
          type="text"
          value={apiPathValue}
          onChange={e => setApiPathValue(e.target.value)}
        />
      </div>

      <Button
        action={() => onSave(hostValue, apiPathValue)}
        size="small"
        className="mt-2 ml-auto"
        disabled={hostValue === host && apiPathValue === apiPath}
      >
        Save
      </Button>

      <Button
        action={() => onReset()}
        size="small"
        aspect="link"
        className="mt-2 ml-auto"
        disabled={
          hostValue === defaultHost &&
          apiPathValue === defaultApiPath
        }
      >
        Reset to default
      </Button>

      <hr />

      <div className="extension-panel-status-group">
        Status: {isSignedIn ? `Signed in` : `Signed out`}
        <span className={classnames("extension-panel-status", { active: isSignedIn })} />
      </div>
      <Button
        action={() => isSignedIn ? onSignout() : onSignin()}
        aspect={isSignedIn ? "warning" : undefined}
        outline={true}
        size="small"
        className="mt-2"
      >
        {isSignedIn ? `Sign out` : `Sign in`}
      </Button>
    </div>
  )
}

export default ExtensionPanel
