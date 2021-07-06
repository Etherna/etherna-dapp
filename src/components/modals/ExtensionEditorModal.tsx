import React, { useEffect, useMemo, useState } from "react"

import { ReactComponent as IndexIcon } from "@svg/icons/navigation/index.svg"
import { ReactComponent as GatewayIcon } from "@svg/icons/navigation/gateway.svg"

import Modal from "@common/Modal"
import Button from "@common/Button"
import ExtensionHostPanel from "@components/env/ExtensionHostPanel"
import useSelector from "@state/useSelector"
import useExtensionEditor from "@state/hooks/ui/useExtensionEditor"

const ExtensionEditorModal = () => {
  const { extensionUrl, extensionName } = useSelector(state => state.ui)
  const [isEditing, setIsEditing] = useState(false)
  const [initialUrl, setInitialUrl] = useState(extensionUrl)
  const [selectedUrl, setSelectedUrl] = useState(initialUrl)
  const { hideEditor } = useExtensionEditor()

  const defaultUrl = useMemo(() => {
    switch (extensionName) {
      case "index": return import.meta.env.VITE_APP_INDEX_URL
      case "gateway": return import.meta.env.VITE_APP_GATEWAY_URL
      default: return ""
    }
  }, [extensionName])

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

  useEffect(() => {
    if (extensionUrl) {
      setInitialUrl(extensionUrl)
      setSelectedUrl(extensionUrl)
    }
  }, [extensionUrl])

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
          <Button action={applyChanges} disabled={isEditing || selectedUrl === initialUrl}>
            Apply changes
          </Button>
          <Button aspect="secondary" action={closeModal} disabled={isEditing}>
            Cancel
          </Button>
        </>
      }
    >
      <ExtensionHostPanel
        listStorageKey={`setting:${extensionName}-hosts`}
        currentStorageKey={`setting:${extensionName}-url`}
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