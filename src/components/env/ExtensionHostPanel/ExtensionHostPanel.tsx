import React, { useMemo, useState } from "react"

import "./extension-host-panel.scss"
import { ReactComponent as EditIcon } from "@svg/icons/edit-icon.svg"
import { ReactComponent as TrashIcon } from "@svg/icons/trash.svg"
import { ReactComponent as CheckIcon } from "@svg/icons/check.svg"
import { ReactComponent as PlusIcon } from "@svg/icons/plus.svg"

import { ExtensionHost } from "./types"
import ExtensionHostsList from "../ExtensionHostsList"
import Button from "@common/Button"
import Label from "@common/Label"
import TextField from "@common/TextField"
import useLocalStorage from "@hooks/useLocalStorage"
import { useErrorMessage } from "@state/hooks/ui"
import { urlHostname } from "@utils/urls"

type ExtensionHostPanelProps = {
  listStorageKey: string
  currentStorageKey: string
  initialValue?: ExtensionHost
  defaultUrl?: string
  description?: string
  onChange?(extension: ExtensionHost): void
  onToggleEditing?(editing: boolean): void
}

const ExtensionHostPanel: React.FC<ExtensionHostPanelProps> = ({
  listStorageKey,
  currentStorageKey,
  initialValue,
  defaultUrl,
  description,
  onChange,
  onToggleEditing
}) => {
  const verifiedOrigins = import.meta.env.VITE_APP_VERIFIED_ORIGINS.split(";")
  const defaultValue = initialValue ? [initialValue] : []
  const [hosts, setHosts] = useLocalStorage(listStorageKey, defaultValue)
  const [selectedUrl, setSelectedUrl] = useLocalStorage(currentStorageKey, defaultUrl)
  const { showError } = useErrorMessage()

  const selectedHost = useMemo(() => {
    return hosts?.find(host => host.url === selectedUrl)
  }, [hosts, selectedUrl])

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(selectedHost?.name ?? "")
  const [url, setUrl] = useState(selectedHost?.url ?? "")

  const isVerifiedOrigin = (url: string | null) => {
    const hostname = urlHostname(url ?? "")
    return verifiedOrigins.some(origin => origin === hostname)
  }

  const toggleEditSelectedHost = () => {
    onToggleEditing?.(!isEditing)
    setIsEditing(editing => !editing)
  }

  const selectHost = (newHost: ExtensionHost) => {
    const selectedHostIndex = hosts!.findIndex(host => host.url === newHost.url)
    setSelectedUrl(hosts![selectedHostIndex].url)
    setName(newHost.name)
    setUrl(newHost.url)
    onChange?.(selectedHost!)
  }

  const addNewHost = () => {
    const newHosts = [...hosts!, { name: "New host", url: "https://" }]
    const selectedHostIndex = newHosts.findIndex(host => host.url === selectedUrl) + 1

    setHosts(newHosts)
    setSelectedUrl(newHosts[selectedHostIndex].url)
    onChange?.(selectedHost!)
  }

  const deleteSelectedHost = () => {
    if (hosts!.length === 1) {
      return showError("Cannot remove this extension", "You need at least 1 extension host")
    }

    const newHosts = [...hosts!]
    const selectedHostIndex = newHosts.findIndex(host => host.url === selectedUrl)
    newHosts.splice(selectedHostIndex, 1)

    const nextIndex = selectedHostIndex < newHosts.length ? selectedHostIndex : 0

    setHosts(newHosts)
    setSelectedUrl(newHosts[nextIndex].url)
    onChange?.(selectedHost!)
  }

  const saveSelectedHost = () => {
    const newHosts = [...hosts!]
    const selectedHostIndex = newHosts.findIndex(host => host.url === selectedUrl)
    newHosts[selectedHostIndex].name = name
    newHosts[selectedHostIndex].url = url

    toggleEditSelectedHost()
    setHosts(newHosts)
    setSelectedUrl(url)
    setIsEditing(false)
    onChange?.(selectedHost!)
  }

  return (
    <div className="extension-host-panel">
      <p className="extension-host-panel-description">{description}</p>

      <div className="extension-host-panel-list-container">
        <ExtensionHostsList
          hosts={hosts ?? []}
          selectedHost={selectedHost}
          isVerifiedOrigin={isVerifiedOrigin}
          onHostSelected={selectHost}
        />
      </div>

      <div className="extension-host-panel-update">
        <div className="extension-host-panel-actions">
          {isEditing ? (
            <Button aspect="transparent" size="small" action={saveSelectedHost}>
              <CheckIcon />
              <span>Save</span>
            </Button>
          ) : (
            <>
              <Button aspect="transparent" size="small" action={addNewHost}>
                <PlusIcon />
                <span>Add</span>
              </Button>

              {!isVerifiedOrigin(selectedUrl) && (
                <div className="extension-host-panel-actions-right">
                  <Button aspect="transparent" size="small" action={toggleEditSelectedHost}>
                    <EditIcon />
                    <span>Edit</span>
                  </Button>
                  <Button aspect="transparent" size="small" action={deleteSelectedHost}>
                    <TrashIcon />
                    <span>Remove</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <form className="extension-host-panel-fields">
          <div className="form-group">
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <TextField id="name" type="text" value={name} onChange={setName} />
            ) : (
              <div className="extension-host-panel-value">{name}</div>
            )}
          </div>
          <div className="form-group">
            <Label htmlFor="url">Url</Label>
            {isEditing ? (
              <TextField id="url" type="text" value={url} onChange={setUrl} />
            ) : (
              <div className="extension-host-panel-value">{url}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExtensionHostPanel
