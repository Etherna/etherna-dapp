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

import React, { useEffect, useMemo, useState } from "react"

import { ReactComponent as IndexIcon } from "@assets/icons/navigation/index.svg"
import { ReactComponent as GatewayIcon } from "@assets/icons/navigation/gateway.svg"

import Modal from "@common/Modal"
import Button from "@common/Button"
import ExtensionHostPanel from "@components/env/ExtensionHostPanel"
import useSelector from "@state/useSelector"
import useExtensionEditor from "@state/hooks/ui/useExtensionEditor"

const ExtensionEditorModal = () => {
  const { extensionName } = useSelector(state => state.ui)
  const STORAGE_LIST_KEY = `setting:${extensionName}-hosts`
  const STORAGE_SELECTED_KEY = `setting:${extensionName}-url`

  const { hideEditor } = useExtensionEditor()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState("")

  const defaultUrl = useMemo(() => {
    switch (extensionName) {
      case "index": return import.meta.env.VITE_APP_INDEX_URL
      case "gateway": return import.meta.env.VITE_APP_GATEWAY_URL
      default: return ""
    }
  }, [extensionName])
  const initialSelectedUrl = useMemo(() => {
    if (localStorage.getItem(STORAGE_SELECTED_KEY)) {
      return JSON.parse(localStorage.getItem(STORAGE_SELECTED_KEY)!)
    }
    return defaultUrl
  }, [defaultUrl, STORAGE_SELECTED_KEY])

  useEffect(() => {
    if (initialSelectedUrl) {
      setSelectedUrl(initialSelectedUrl)
    }
  }, [initialSelectedUrl])

  const description = useMemo(() => {
    switch (extensionName) {
      case "index":
        return `The index is information provider, or rather the list of videos,
        users and comments of the platform.
        By changing the index you can customize your experience with different contents.`
      case "gateway":
        return `The gateway is the source of the data, or rather the video information or
        a profile information. The default gateway is also linked with your Etherna account and credit system.
        By changing the gateway you decide how the data is gathered in the app, hence a different payment system.`
      default: return ""
    }
  }, [extensionName])

  const closeModal = () => {
    hideEditor()
  }

  const applyChanges = () => {
    window.location.reload()
  }

  return (
    <Modal
      show={!!extensionName}
      showCloseButton={false}
      showCancelButton={false}
      title={`Edit current ${extensionName}`}
      icon={
        extensionName === "index" ? (
          <IndexIcon />
        ) : extensionName === "gateway" ? (
          <GatewayIcon />
        ) : null
      }
      footerButtons={
        <>
          <Button onClick={applyChanges} disabled={isEditing || selectedUrl === initialSelectedUrl}>
            Apply changes
          </Button>
          <Button modifier="secondary" onClick={closeModal} disabled={isEditing}>
            Cancel
          </Button>
        </>
      }
    >
      <ExtensionHostPanel
        listStorageKey={STORAGE_LIST_KEY}
        currentStorageKey={STORAGE_SELECTED_KEY}
        defaultUrl={defaultUrl}
        initialValue={{ name: `Etherna ${extensionName}`, url: defaultUrl }}
        description={description}
        onChange={host => setSelectedUrl(host.url)}
        onToggleEditing={setIsEditing}
      />
    </Modal>
  )
}

export default ExtensionEditorModal
