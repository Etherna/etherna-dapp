import React, { useEffect, useState, useRef } from "react"
import classnames from "classnames"

import Modal from "../common/Modal"
import Button from "../common/Button"
import Kbd from "../common/Kbd"
import { ReactComponent as WarningIcon } from "@svg/icons/warning-icon.svg"
import { closeShortcutModal } from "@state/actions/modals"
import { saveShortcut, shortcutExists } from "@state/actions/enviroment/shortcuts"
import useSelector from "@state/useSelector"

const key2string = require("key-event-to-string")()

const ShortcutModal = ({ show = false }) => {
  const { shortcutNamespace, shortcutKey, keymap, lang } = useSelector(state => state.env)
  const [shortcut, setShortcut] = useState<string>()
  const [existingShortcut, setExistingShortcut] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shortcutNamespace || !shortcutKey) return

    if (shortcutNamespace in keymap && shortcutKey in keymap[shortcutNamespace]) {
      const namespace = keymap[shortcutNamespace]
      const shortcut = namespace[shortcutKey]
      setShortcut(shortcut)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutNamespace, shortcutKey])

  useEffect(() => {
    focusEditor()
  }, [editorRef])

  const focusEditor = () => {
    if (editorRef && editorRef.current) {
      editorRef.current.focus()
    }
  }

  const deleteShortcut = () => {
    setShortcut(undefined)
  }

  const overrideShortcut = () => {
    saveShortcut(shortcut)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const shortcut = key2string(e).toLowerCase()
    setShortcut(shortcut)

    setExistingShortcut(!!shortcutExists(shortcut))
  }

  return (
    <Modal show={show} showCloseButton={true} onClose={() => closeShortcutModal()}>
      <div
        ref={editorRef}
        className={classnames("shortcut-preview-container", {
          "shortcut-error": existingShortcut,
        })}
        tabIndex={0}
        onClick={focusEditor}
        onKeyDown={handleKeyDown}
      >
        {shortcut && <Kbd className="shortcut-preview" shortcut={shortcut} />}
      </div>
      {existingShortcut && (
        <div className="flex items-center my-4">
          <WarningIcon className="mr-2" width="16" />
          <span>
            Shortcut already set for: <strong>{lang.get(`player.${existingShortcut}`)}</strong>
          </span>
        </div>
      )}
      <div className="flex">
        <Button aspect="danger" className="flex-1 mr-1" action={deleteShortcut}>
          Delete
        </Button>
        <Button
          aspect="secondary"
          className="flex-1 ml-1"
          action={overrideShortcut}
          disabled={!!existingShortcut}
        >
          Save
        </Button>
      </div>
    </Modal>
  )
}

export default ShortcutModal
