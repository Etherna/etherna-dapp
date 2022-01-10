import React, { useState } from "react"

import Modal from "@common/Modal"
import Button from "@common/Button"
import useLocalStorage from "@hooks/useLocalStorage"

const RootLegacy: React.FC = () => {
  const [hideUnsupported, setHideUnsupported] = useLocalStorage("setting:hide-unsupported", false)
  const [open, setOpen] = useState(!hideUnsupported)

  const closeAndDontShowAgain = () => {
    setHideUnsupported(true)
    close()
  }

  const close = () => {
    setOpen(false)
  }

  return (
    <Modal
      show={open}
      title="Update your browser"
      onClose={() => setOpen(false)}
      footerButtons={
        <>
          <Button modifier="secondary" onClick={close}>Continue</Button>
          <Button modifier="warning" onClick={closeAndDontShowAgain}>Don&apos;t show again</Button>
        </>
      }
    >
      Seems like you are using an old browser and some features may appear broken.
      <strong> Please consider updating your browser</strong>.
    </Modal>
  )
}

export default RootLegacy
