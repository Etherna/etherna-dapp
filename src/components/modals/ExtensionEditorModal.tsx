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
import { Button, Modal } from "@/components/ui/actions"
import useExtensionEditor from "@/hooks/useExtensionEditor"
import sessionStore from "@/stores/session"
import useUIStore from "@/stores/ui"
import userStore from "@/stores/user"

import type { ExtensionParamConfig } from "@/components/env/ExtensionHostPanel"
import type { GatewayExtensionHost, IndexExtensionHost } from "@/types/extension-host"

const ExtensionEditorModal = <T extends IndexExtensionHost | GatewayExtensionHost>() => {
  const extension = useUIStore(state => state.extension)
  const { hideEditor } = useExtensionEditor()

  const hostParams: ExtensionParamConfig[] = useMemo(() => {
    const defaultParams: ExtensionParamConfig[] = [
      { key: "name", label: "Name", mandatory: true },
      { key: "url", label: "Url", mandatory: true },
    ]
    switch (extension?.type) {
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
  }, [extension?.type])

  const description = useMemo(() => {
    switch (extension?.type) {
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
  }, [extension?.type])

  const closeModal = useCallback(() => {
    hideEditor()
  }, [hideEditor])

  const applyChanges = useCallback(() => {
    // clear storages and reload
    sessionStore.persist.clearStorage()
    userStore.persist.clearStorage()
    window.location.reload()
  }, [])

  return (
    <Modal
      show={!!extension}
      showCloseButton={false}
      showCancelButton={false}
      title={`Edit current ${extension?.type}`}
      icon={
        extension?.type === "index" ? (
          <IndexIcon />
        ) : extension?.type === "gateway" ? (
          <GatewayIcon />
        ) : null
      }
      footerButtons={
        <>
          <Button onClick={applyChanges} disabled={false}>
            Switch {extension?.type}
          </Button>
          <Button color="muted" onClick={closeModal} disabled={false}>
            Done
          </Button>
        </>
      }
      large
    >
      <ExtensionHostPanel<T>
        hostParams={hostParams}
        description={description}
        type={extension?.type ?? "index"}
      />
    </Modal>
  )
}

export default ExtensionEditorModal
