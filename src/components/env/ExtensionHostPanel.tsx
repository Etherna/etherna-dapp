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

import React, { useCallback, useMemo, useState } from "react"

import { TrashIcon, PlusIcon } from "@heroicons/react/24/solid"

import ExtensionHostForm from "./ExtensionHostForm"
import ExtensionHostsList from "./ExtensionHostsList"
import { Button, Modal } from "@/components/ui/actions"
import type { ExtensionType } from "@/definitions/app-state"
import type { GatewayExtensionHost, IndexExtensionHost } from "@/definitions/extension-host"
import useLocalStorage from "@/hooks/useLocalStorage"
import { useConfirmation, useErrorMessage } from "@/state/hooks/ui"
import { isSafeURL } from "@/utils/urls"

type ExtensionHostPanelProps<T extends IndexExtensionHost | GatewayExtensionHost> = {
  listStorageKey: string
  currentStorageKey: string
  hostParams: ExtensionParamConfig[]
  initialValue?: T
  defaultUrl?: string
  description?: string
  type: ExtensionType
  onChange?(extension: T): void
}

export type ExtensionParamConfig = {
  key: keyof (IndexExtensionHost & GatewayExtensionHost)
  label: string
  mandatory: boolean
  hidden?: boolean
  default?: string
  type?: "text" | "gatetype"
  options?: { value: string; label: string; description?: string }[]
}

const EthernaUrls = [
  import.meta.env.VITE_APP_GATEWAY_URL,
  import.meta.env.VITE_APP_INDEX_URL,
  import.meta.env.VITE_APP_CREDIT_URL,
]

const ExtensionHostPanel = <T extends IndexExtensionHost | GatewayExtensionHost>({
  listStorageKey,
  currentStorageKey,
  hostParams,
  initialValue,
  defaultUrl,
  description,
  type,
  onChange,
}: ExtensionHostPanelProps<T>) => {
  const defaultValue = initialValue ? [initialValue] : []
  const [storageHosts, setStorageHosts] = useLocalStorage(listStorageKey, defaultValue)
  const [storageSelectedUrl, setStorageSelectedUrl] = useLocalStorage(currentStorageKey, defaultUrl)
  const [hosts, setHosts] = useState(storageHosts)
  const [selectedUrl, setSelectedUrl] = useState(storageSelectedUrl)
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [editorTempExtension, setEditorTempExtension] = useState<T | undefined>()

  const { showError } = useErrorMessage()
  const { waitConfirmation } = useConfirmation()

  const selectedHost = useMemo(() => {
    return hosts?.find(host => host.url === selectedUrl)
  }, [hosts, selectedUrl])

  const cantSaveHost = useMemo(() => {
    if (!editorTempExtension) return true

    for (const param of hostParams) {
      if (param.mandatory && !editorTempExtension[param.key as keyof T]) {
        return true
      }
    }

    return false
  }, [editorTempExtension, hostParams])

  const hideEditor = useCallback(() => {
    setShowEditorModal(false)
    setEditorTempExtension(undefined)
  }, [])

  const deleteHost = useCallback(
    (host: T) => {
      if (hosts!.length === 1) {
        return showError("Cannot remove this extension", "You need at least 1 extension host")
      }

      const newHosts = [...hosts!]
      const selectedHostIndex = newHosts.findIndex(h => h.url === host.url)
      newHosts.splice(selectedHostIndex, 1)

      const nextIndex = selectedHostIndex < newHosts.length ? selectedHostIndex : 0

      setHosts(newHosts)
      setStorageHosts(newHosts)
      setSelectedUrl(newHosts[nextIndex].url)
      setStorageSelectedUrl(newHosts[nextIndex].url)
      hideEditor()
      onChange?.(host)
    },
    [hosts, onChange, setStorageHosts, setStorageSelectedUrl, showError, hideEditor]
  )

  const askToDeleteHost = useCallback(
    async (host: T) => {
      if (
        await waitConfirmation(
          "Are you sure you want to delete this host?",
          "This action cannot be undone",
          "Delete",
          "destructive"
        )
      ) {
        deleteHost(host)
      }
    },
    [deleteHost, waitConfirmation]
  )

  const editHost = useCallback((host: T) => {
    setSelectedUrl(host.url)
    setEditorTempExtension(host)
    setShowEditorModal(true)
  }, [])

  const selectHost = useCallback(
    (newHost: T) => {
      if (newHost.url === selectedUrl) {
        editHost(newHost)
        return
      }

      const selectedHostIndex = hosts!.findIndex(host => host.url === newHost.url)
      setSelectedUrl(hosts![selectedHostIndex].url)
      setStorageSelectedUrl(hosts![selectedHostIndex].url)
      onChange?.(newHost)
    },
    [selectedUrl, hosts, setStorageSelectedUrl, onChange, editHost]
  )

  const addHost = useCallback(() => {
    setSelectedUrl(null)
    setShowEditorModal(true)
  }, [])

  const cancelEditingHost = useCallback(() => {
    setEditorTempExtension(undefined)
    hideEditor()
  }, [hideEditor])

  const createOrUpdateEditingHost = useCallback(() => {
    if (!isSafeURL(editorTempExtension!.url)) {
      return showError("URL Error", "Please insert a valid URL")
    }
    if (!editorTempExtension!.url.startsWith("https")) {
      return showError("URL Error", "The URL must be over https")
    }

    const newHosts = [...hosts!]
    const selectedHostIndex = newHosts.findIndex(host => host.url === editorTempExtension!.url)

    for (const param of hostParams) {
      const key = param.key as keyof T
      editorTempExtension![key] = editorTempExtension![key]
        ? editorTempExtension![key]
        : param.default ?? (null as any)
    }

    if (selectedHostIndex === -1) {
      newHosts.push(editorTempExtension!)
    } else {
      newHosts[selectedHostIndex] = editorTempExtension!
    }

    setHosts(newHosts)
    setStorageHosts(newHosts)
    setSelectedUrl(editorTempExtension!.url)
    setStorageSelectedUrl(editorTempExtension!.url)
    hideEditor()
    onChange?.(selectedHost!)
  }, [
    editorTempExtension,
    hosts,
    selectedHost,
    hostParams,
    onChange,
    setStorageHosts,
    setStorageSelectedUrl,
    showError,
    hideEditor,
  ])

  return (
    <>
      <div className="text-left">
        <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-400">
          {description}
        </p>

        <Button className="mt-4" onClick={addHost} color="inverted" small>
          <PlusIcon />
          Add new
        </Button>

        <div className="sm:w-[calc(100%-1rem)]">
          <ExtensionHostsList
            hosts={hosts ?? []}
            selectedHost={selectedHost}
            allowDelete={host => !EthernaUrls.includes(host.url)}
            onSelect={selectHost}
            onEdit={editHost}
            onDelete={askToDeleteHost}
            type={type}
          />
        </div>
      </div>

      <Modal
        show={showEditorModal}
        title={selectedHost ? "Edit host" : "Add new host"}
        footerButtons={
          <>
            <Button
              className="sm:ml-auto"
              onClick={createOrUpdateEditingHost}
              disabled={cantSaveHost}
            >
              Save
            </Button>
            {selectedHost && !EthernaUrls.includes(selectedHost.url) && (
              <Button
                className="mr-auto w-full sm:w-auto"
                aspect="text"
                color="error"
                prefix={<TrashIcon width={20} aria-hidden />}
                onClick={() => askToDeleteHost(selectedHost)}
              >
                Delete
              </Button>
            )}
          </>
        }
        showCloseButton
        onClose={cancelEditingHost}
      >
        <ExtensionHostForm<T>
          value={editorTempExtension}
          params={hostParams}
          onChange={setEditorTempExtension}
        />
      </Modal>
    </>
  )
}

export default ExtensionHostPanel
