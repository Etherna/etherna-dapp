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
import React, { useCallback, useEffect, useMemo, useState } from "react"

import { ReactComponent as GatewayIcon } from "@/assets/icons/navigation/gateway.svg"
import { ReactComponent as IndexIcon } from "@/assets/icons/navigation/index.svg"

import ExtensionHostPanel from "@/components/env/ExtensionHostPanel"
import type { ExtensionParamConfig } from "@/components/env/ExtensionHostPanel"
import { Button, Modal } from "@/components/ui/actions"
import type { GatewayExtensionHost, IndexExtensionHost } from "@/definitions/extension-host"
import useExtensionEditor from "@/state/hooks/ui/useExtensionEditor"
import useSelector from "@/state/useSelector"

const ExtensionEditorModal = <T extends IndexExtensionHost | GatewayExtensionHost>() => {
  const extensionName = useSelector(state => state.ui.extensionName)

  const STORAGE_LIST_KEY = `setting:${extensionName}-hosts`
  const STORAGE_SELECTED_KEY = `setting:${extensionName}-url`

  const { hideEditor } = useExtensionEditor()
  const [openModal, setOpenModal] = useState(false)
  const [editingExtension, setEditingExtension] = useState<string>()

  const defaultUrl = useMemo(() => {
    switch (editingExtension) {
      case "index":
        return import.meta.env.VITE_APP_INDEX_URL
      case "gateway":
        return import.meta.env.VITE_APP_GATEWAY_URL
      default:
        return ""
    }
  }, [editingExtension])

  const initialValue: T | undefined = useMemo(() => {
    switch (editingExtension) {
      case "index":
        return { name: `Etherna ${editingExtension}`, url: defaultUrl } as unknown as T
      case "gateway":
        return { name: `Etherna ${editingExtension}`, url: defaultUrl } as unknown as T
    }
  }, [editingExtension, defaultUrl])

  const hostParams: ExtensionParamConfig[] = useMemo(() => {
    const defaultParams: ExtensionParamConfig[] = [
      { key: "name", label: "Name", mandatory: true },
      { key: "url", label: "Url", mandatory: true },
    ]
    switch (editingExtension) {
      case "index":
        return defaultParams
      case "gateway":
        return [
          ...defaultParams,
          {
            key: "type",
            label: "Gateway Type",
            mandatory: false,
            hidden: true,
            default: "bee",
            type: "gatetype",
            options: [
              {
                value: "etherna-gateway",
                label: "Etherna Gateway",
                description:
                  "Select this if the gateway is an official gateway by Etherna or " +
                  "it's a custom host compliant with the Etherna gateway APIs",
              },
              {
                value: "bee",
                label: "Bee Instance",
                description: "Select this if the gateway is the default swarm bee instance",
              },
            ],
          },
        ]
      default:
        return defaultParams
    }
  }, [editingExtension])

  const description = useMemo(() => {
    switch (editingExtension) {
      case "index":
        return `The index is information provider, or rather the list of videos,
        users and comments of the platform.
        By changing the index you can customize your experience with different contents.`.replaceAll(
          "\n",
          ""
        )
      case "gateway":
        return `The gateway is the source of the data, or rather the video information or
        a profile information. The default gateway is also linked with your Etherna account and credit system.
        By changing the gateway you decide how the data is gathered in the app, hence a different payment system.`.replaceAll(
          "\n",
          ""
        )
      default:
        return ""
    }
  }, [editingExtension])

  useEffect(() => {
    extensionName && setEditingExtension(extensionName)
    setOpenModal(!!extensionName)
  }, [extensionName])

  const closeModal = useCallback(() => {
    hideEditor()
  }, [hideEditor])

  const applyChanges = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <Modal
      show={openModal}
      showCloseButton={false}
      showCancelButton={false}
      title={`Edit current ${editingExtension}`}
      icon={
        editingExtension === "index" ? (
          <IndexIcon />
        ) : editingExtension === "gateway" ? (
          <GatewayIcon />
        ) : null
      }
      footerButtons={
        <>
          <Button onClick={applyChanges} disabled={false}>
            Switch {editingExtension}
          </Button>
          <Button color="muted" onClick={closeModal} disabled={false}>
            Done
          </Button>
        </>
      }
      large
    >
      <ExtensionHostPanel<T>
        listStorageKey={STORAGE_LIST_KEY}
        currentStorageKey={STORAGE_SELECTED_KEY}
        hostParams={hostParams}
        defaultUrl={defaultUrl}
        initialValue={initialValue}
        description={description}
        type={extensionName ?? "index"}
      />
    </Modal>
  )
}

export default ExtensionEditorModal
