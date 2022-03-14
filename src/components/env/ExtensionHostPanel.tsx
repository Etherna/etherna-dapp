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
import classNames from "classnames"

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
import { useErrorMessage } from "@state/hooks/ui"
import { isSafeURL, urlHostname } from "@utils/urls"
import type { GatewayExtensionHost, IndexExtensionHost } from "@definitions/extension-host"

type ExtensionHostPanelProps<T> = {
  listStorageKey: string
  currentStorageKey: string
  hostParams: Array<{ key: string, label: string, mandatory: boolean }>
  initialValue?: T
  defaultUrl?: string
  description?: string
  isSignedIn: boolean
  signInUrl?: string | null
  onChange?(extension: T): void
  onToggleEditing?(editing: boolean): void
}

const ExtensionHostPanel = <T extends IndexExtensionHost | GatewayExtensionHost,>({
  listStorageKey,
  currentStorageKey,
  hostParams,
  initialValue,
  defaultUrl,
  description,
  isSignedIn,
  signInUrl,
  onChange,
  onToggleEditing
}: ExtensionHostPanelProps<T>) => {
  const verifiedOrigins = import.meta.env.VITE_APP_VERIFIED_ORIGINS.split(";")
  const defaultValue = initialValue ? [initialValue] : []
  const [storageHosts, setStorageHosts] = useLocalStorage(listStorageKey, defaultValue)
  const [storageSelectedUrl, setStorageSelectedUrl] = useLocalStorage(currentStorageKey, defaultUrl)
  const [hosts, setHosts] = useState(storageHosts)
  const [selectedUrl, setSelectedUrl] = useState(storageSelectedUrl)
  const { showError } = useErrorMessage()

  const selectedHost = useMemo(() => {
    return hosts?.find(host => host.url === selectedUrl)
  }, [hosts, selectedUrl])

  const reduceHostValues = (host: T | undefined) => {
    return hostParams.reduce(
      (values, param) => ({
        ...values,
        [param.key]: (host?.[param.key as keyof T] ?? "") as string
      }),
      {} as Record<string, string>
    )
  }

  const [isEditing, setIsEditing] = useState(false)
  const [paramsValues, setParamsValues] = useState(reduceHostValues(selectedHost))

  const isVerifiedOrigin = (url: string | null) => {
    const hostname = urlHostname(url ?? "")
    return verifiedOrigins.some(origin => origin === hostname || hostname?.endsWith("." + origin))
  }

  const toggleEditSelectedHost = () => {
    onToggleEditing?.(!isEditing)
    setIsEditing(editing => !editing)
  }

  const selectHost = (newHost: T) => {
    const selectedHostIndex = hosts!.findIndex(host => host.url === newHost.url)
    setSelectedUrl(hosts![selectedHostIndex].url)
    setStorageSelectedUrl(hosts![selectedHostIndex].url)
    updateParamsValuesForHost(newHost)
    onChange?.(newHost)
  }

  const addNewHost = () => {
    const newHost = { name: "New host", url: "https://" } as T

    setHosts([...hosts!, newHost])
    setSelectedUrl(newHost.url)
    updateParamsValuesForHost(newHost)
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
    setStorageHosts(newHosts)
    setSelectedUrl(newHosts[nextIndex].url)
    setStorageSelectedUrl(newHosts[nextIndex].url)
    updateParamsValuesForHost(newHosts[nextIndex])
    onChange?.(selectedHost!)
    isEditing && toggleEditSelectedHost()
  }

  const updateParamsValuesForHost = (host: T) => {
    const values = reduceHostValues(host)
    setParamsValues(values)
  }

  const updateParamsValuesForKey = (key: string, value: string) => {
    const values = { ...paramsValues }
    values[key] = value
    setParamsValues(values)
  }

  const saveSelectedHost = () => {
    if (!paramsValues.name) {
      return showError("Host name error", "Please type a host name")
    }
    if (!isSafeURL(paramsValues.url)) {
      return showError("URL Error", "Please insert a valid URL")
    }

    for (const param of hostParams) {
      if (param.mandatory && !paramsValues[param.key]) {
        return showError(`Field ${param.label} is mandatory`, `Please enter a value`)
      }
    }

    const newHosts = [...hosts!]
    const selectedHostIndex = newHosts.findIndex(host => host.url === selectedUrl)

    for (const param of hostParams) {
      newHosts[selectedHostIndex][param.key as keyof T] = paramsValues[param.key] as any
    }

    toggleEditSelectedHost()
    setHosts(newHosts)
    setStorageHosts(newHosts)
    setSelectedUrl(paramsValues.url)
    setStorageSelectedUrl(paramsValues.url)
    setIsEditing(false)
    onChange?.(selectedHost!)
  }

  const signin = () => {
    const retUrl = encodeURIComponent(window.location.href)
    window.location.href = signInUrl! + `?ReturnUrl=${retUrl}`
  }

  return (
    <div className={classes.extensionHostPanel}>
      <div className={classNames(classes.extensionHostPanelAuth, {
        [classes.auth]: isSignedIn
      })}>
        {isSignedIn ? "Authenticated" : "Not authenticated"}
      </div>

      {!isSignedIn && signInUrl && selectedUrl === initialValue?.url && (
        <Button className="ml-3" modifier="primary" small onClick={signin}>
          Sign in
        </Button>
      )}

      <p className={classes.extensionHostPanelDescription}>{description}</p>

      <div className={classes.extensionHostPanelListContainer}>
        <ExtensionHostsList
          hosts={hosts ?? []}
          selectedHost={selectedHost}
          editing={isEditing}
          isVerifiedOrigin={isVerifiedOrigin}
          onHostSelected={selectHost}
        />
      </div>

      <div className={classes.extensionHostPanelUpdate}>
        <div className={classes.extensionHostPanelActions}>
          {isEditing ? (
            <div className="space-x-3">
              <Button className={classes.btn} modifier="secondary" onClick={saveSelectedHost} small>
                <CheckIcon />
                <span>Save</span>
              </Button>
              <Button className={classes.btnText} modifier="transparent" onClick={deleteSelectedHost} small>
                <TrashIcon />
                <span>Remove</span>
              </Button>
            </div>
          ) : (
            <>
              {selectedUrl !== defaultUrl && (
                <div className="space-x-3">
                  <Button className={classes.btnText} modifier="transparent" onClick={toggleEditSelectedHost} small>
                    <EditIcon />
                    <span>Edit</span>
                  </Button>
                  <Button className={classes.btnText} modifier="transparent" onClick={deleteSelectedHost} small>
                    <TrashIcon />
                    <span>Remove</span>
                  </Button>
                </div>
              )}

              <div className={classes.extensionHostPanelActionsRight}>
                <Button className={classes.btn} modifier="inverted" aspect="outline" onClick={addNewHost} small>
                  <PlusIcon />
                  <span>Add</span>
                </Button>
              </div>
            </>
          )}
        </div>

        <form className={classes.extensionHostPanelFields}>
          {hostParams.map(param => (
            <FormGroup key={param.key}>
              {(!!paramsValues[param.key] || isEditing) && (
                <Label htmlFor={param.key}>{param.label}</Label>
              )}
              {isEditing ? (
                <TextField
                  id={param.key}
                  type="text"
                  value={paramsValues[param.key]}
                  onChange={val => updateParamsValuesForKey(param.key, val)}
                  autoFocus
                />
              ) : paramsValues[param.key] ? (
                <div className={classes.extensionHostPanelValue}>{paramsValues[param.key]}</div>
              ) : null}
            </FormGroup>
          ))}
        </form>
      </div>
    </div>
  )
}

export default ExtensionHostPanel
