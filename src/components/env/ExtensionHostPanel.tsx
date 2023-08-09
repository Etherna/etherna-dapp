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
import { isSafeURL } from "@etherna/sdk-js/utils"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid"

import ExtensionHostForm from "./ExtensionHostForm"
import ExtensionHostsList from "./ExtensionHostsList"
import { Button, Modal } from "@/components/ui/actions"
import useConfirmation from "@/hooks/useConfirmation"
import useErrorMessage from "@/hooks/useErrorMessage"
import useExtensionsStore from "@/stores/extensions"

import type { ExtensionType } from "@/stores/ui"
import type { GatewayExtensionHost, IndexExtensionHost } from "@/types/extension-host"

type ExtensionHostPanelProps<T extends IndexExtensionHost | GatewayExtensionHost> = {
  hostParams: ExtensionParamConfig[]
  description?: string
  type: ExtensionType
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
  hostParams,
  description,
  type,
}: ExtensionHostPanelProps<T>) => {
  const extensionsList = useExtensionsStore(state =>
    type === "gateway" ? state.gatewaysList : state.indexesList
  )
  const currentUrl = useExtensionsStore(state =>
    type === "gateway" ? state.currentGatewayUrl : state.currentIndexUrl
  )
  const addExtension = useExtensionsStore(state =>
    type === "gateway" ? state.addGateway : state.addIndex
  ) as (e: T) => void
  const removeExtension = useExtensionsStore(state =>
    type === "gateway" ? state.removeGateway : state.removeIndex
  )
  const updateExtension = useExtensionsStore(state =>
    type === "gateway" ? state.updateGateway : state.updateIndex
  )
  const setCurrentUrl = useExtensionsStore(state =>
    type === "gateway" ? state.setCurrentGatewayUrl : state.setCurrentIndexUrl
  )
  const [editingUrl, setEditingUrl] = useState<string | null>(null)
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [editorTempExtension, setEditorTempExtension] = useState<T | undefined>()

  const { showError } = useErrorMessage()
  const { waitConfirmation } = useConfirmation()

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

  const deleteExtension = useCallback(
    (url: string) => {
      if (extensionsList!.length === 1) {
        return showError("Cannot remove this extension", "You need at least 1 extension url")
      }

      currentUrl === url && setCurrentUrl(extensionsList[0].url)
      removeExtension(url)
      hideEditor()
    },
    [extensionsList, currentUrl, setCurrentUrl, removeExtension, hideEditor, showError]
  )

  const askToDeleteExtension = useCallback(
    async (url: string) => {
      if (
        await waitConfirmation(
          "Are you sure you want to delete this host?",
          "This action cannot be undone",
          "Delete",
          "destructive"
        )
      ) {
        deleteExtension(url)
      }
    },
    [deleteExtension, waitConfirmation]
  )

  const editHost = useCallback((host: T) => {
    setEditingUrl(host.url)
    setEditorTempExtension(host)
    setShowEditorModal(true)
  }, [])

  const selectHost = useCallback(
    (newHost: T) => {
      if (newHost.url === editingUrl) {
        editHost(newHost)
        return
      }

      const selectedHostIndex = extensionsList!.findIndex(host => host.url === newHost.url)
      setEditingUrl(extensionsList![selectedHostIndex].url)
      setCurrentUrl(extensionsList![selectedHostIndex].url)
    },
    [editingUrl, extensionsList, setCurrentUrl, editHost]
  )

  const addHost = useCallback(() => {
    setEditingUrl(null)
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

    const selectedHostIndex = extensionsList.findIndex(host => host.url === editingUrl)

    for (const param of hostParams) {
      const key = param.key as keyof T
      editorTempExtension![key] = editorTempExtension![key]
        ? editorTempExtension![key]
        : param.default ?? (null as any)
    }

    if (selectedHostIndex === -1) {
      addExtension(editorTempExtension!)
    } else {
      updateExtension(editingUrl!, editorTempExtension!)
    }

    hideEditor()
  }, [
    hostParams,
    editingUrl,
    editorTempExtension,
    extensionsList,
    addExtension,
    hideEditor,
    showError,
    updateExtension,
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
            hosts={extensionsList ?? []}
            selectedExtensionUrl={currentUrl}
            allowDelete={host => !EthernaUrls.includes(host.url)}
            onSelect={selectHost}
            onEdit={editHost}
            onDelete={ext => askToDeleteExtension(ext.url)}
            type={type}
          />
        </div>
      </div>

      <Modal
        show={showEditorModal}
        title={editingUrl ? "Edit host" : "Add new host"}
        footerButtons={
          <>
            <Button
              className="sm:ml-auto"
              onClick={createOrUpdateEditingHost}
              disabled={cantSaveHost}
            >
              Save
            </Button>
            {editingUrl && !EthernaUrls.includes(editingUrl) && (
              <Button
                className="mr-auto w-full sm:w-auto"
                aspect="text"
                color="error"
                prefix={<TrashIcon width={20} aria-hidden />}
                onClick={() => askToDeleteExtension(editingUrl)}
              >
                Delete
              </Button>
            )}
          </>
        }
        showCloseButton
        onClose={cancelEditingHost}
      >
        <div className="mt-6">
          <ExtensionHostForm<T>
            value={editorTempExtension}
            params={hostParams}
            onChange={setEditorTempExtension}
          />
        </div>
      </Modal>
    </>
  )
}

export default ExtensionHostPanel
