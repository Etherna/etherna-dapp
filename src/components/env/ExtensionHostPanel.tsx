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

import React, { useMemo, useState } from "react"

import classes from "@styles/components/env/ExtensionHostPanel.module.scss"
import { ReactComponent as EditIcon } from "@assets/icons/edit.svg"
import { ReactComponent as TrashIcon } from "@assets/icons/trash.svg"
import { ReactComponent as CheckIcon } from "@assets/icons/check.svg"
import { ReactComponent as PlusIcon } from "@assets/icons/plus.svg"

import ExtensionHostsList from "./ExtensionHostsList"
import Button from "@common/Button"
import Label from "@common/Label"
import FormGroup from "@common/FormGroup"
import TextField from "@common/TextField"
import useLocalStorage from "@hooks/useLocalStorage"
import { ExtensionHost } from "@definitions/extension-host"
import { useErrorMessage } from "@state/hooks/ui"
import { isSafeURL, urlHostname } from "@utils/urls"

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
    onChange?.(newHost)
  }

  const addNewHost = () => {
    const newHost = { name: "New host", url: "https://" }

    setHosts([...hosts!, newHost])
    setSelectedUrl(newHost.url)
    setName(newHost.name)
    setUrl(newHost.url)
    toggleEditSelectedHost()
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
    setName(newHosts[nextIndex].name)
    setUrl(newHosts[nextIndex].url)
    onChange?.(selectedHost!)
    isEditing && toggleEditSelectedHost()
  }

  const saveSelectedHost = () => {
    if (!name) {
      return showError("Host name error", "Please type a host name")
    }
    if (!isSafeURL(url)) {
      return showError("URL Error", "Please insert a valid URL")
    }

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
    <div className={classes.extensionHostPanel}>
      <p className={classes.extensionHostPanelDescription}>{description}</p>

      <div className={classes.extensionHostPanelListContainer}>
        <ExtensionHostsList
          hosts={hosts ?? []}
          selectedHost={selectedHost}
          isVerifiedOrigin={isVerifiedOrigin}
          onHostSelected={selectHost}
        />
      </div>

      <div className={classes.extensionHostPanelUpdate}>
        <div className={classes.extensionHostPanelActions}>
          {isEditing ? (
            <>
              <Button className={classes.btn} modifier="transparent" onClick={saveSelectedHost} small>
                <CheckIcon />
                <span>Save</span>
              </Button>
              <div className={classes.extensionHostPanelActionsRight}>
                <Button className={classes.btn} modifier="transparent" onClick={deleteSelectedHost} small>
                  <TrashIcon />
                  <span>Remove</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button className={classes.btn} modifier="transparent" onClick={addNewHost} small>
                <PlusIcon />
                <span>Add</span>
              </Button>

              {!isVerifiedOrigin(selectedUrl) && (
                <div className={classes.extensionHostPanelActionsRight}>
                  <Button className={classes.btn} modifier="transparent" onClick={toggleEditSelectedHost} small>
                    <EditIcon />
                    <span>Edit</span>
                  </Button>
                  <Button className={classes.btn} modifier="transparent" onClick={deleteSelectedHost} small>
                    <TrashIcon />
                    <span>Remove</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <form className={classes.extensionHostPanelFields}>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <TextField id="name" type="text" value={name} onChange={setName} autoFocus />
            ) : (
              <div className={classes.extensionHostPanelValue}>{name}</div>
            )}
          </FormGroup>
          <FormGroup>
            <Label htmlFor="url">Url</Label>
            {isEditing ? (
              <TextField id="url" type="text" value={url} onChange={setUrl} />
            ) : (
              <div className={classes.extensionHostPanelValue}>{url}</div>
            )}
          </FormGroup>
        </form>
      </div>
    </div>
  )
}

export default ExtensionHostPanel
