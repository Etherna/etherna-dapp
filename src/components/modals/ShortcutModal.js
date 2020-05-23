import React, { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import classnames from "classnames"

import Modal from "../common/Modal"
import Button from "../common/Button"
import { closeShortcutModal } from "@state/actions/modals"
import { saveShortcut, shortcutExists } from "@state/actions/enviroment/shortcuts"
import Kbd from "@components/common/Kbd"

const key2string = require("key-event-to-string")()

const ShortcutModal = () => {
    const { shortcutNamespace, shortcutKey, keymap, lang } = useSelector(
        state => state.env
    )
    const [shortcut, setShortcut] = useState(
        keymap[shortcutNamespace][shortcutKey]
    )
    const [existingShortcut, setExistingShortcut] = useState(false)
    const editorRef = useRef()

    useEffect(() => {
        focusEditor()
    }, [editorRef])

    const focusEditor = () => {
        if (editorRef && editorRef.current) {
            editorRef.current.focus()
        }
    }

    const deleteShortcut = () => {
        setShortcut(null)
    }

    const overrideShortcut = () => {
        saveShortcut(shortcut)
    }

    const handleKeyDown = e => {
        e.stopPropagation()
        e.preventDefault()

        const shortcut = key2string(e).toLowerCase()
        setShortcut(shortcut)

        setExistingShortcut(shortcutExists(shortcut))
    }

    return (
        <Modal
            show={true}
            showCloseButton={true}
            onClose={() => closeShortcutModal()}
        >
            <div
                ref={editorRef}
                className={classnames("shortcut-preview-container", {
                    "shortcut-error": existingShortcut
                })}
                tabIndex={0}
                onClick={focusEditor}
                onKeyDown={handleKeyDown}
            >
                {shortcut && (
                    <Kbd className="shortcut-preview" shortcut={shortcut} />
                )}
            </div>
            {existingShortcut && (
                <div className="flex items-center my-4">
                    <img className="mr-2" src={require("@svg/icons/warning-icon.svg")} alt="" width="16" />
                    <span>Shortcut already set for: <strong>{lang.get(`player.${existingShortcut}`)}</strong></span>
                </div>
            )}
            <div className="flex">
                <Button
                    aspect="danger"
                    className="flex-1 mr-1"
                    action={deleteShortcut}
                >
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
