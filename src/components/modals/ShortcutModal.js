import React, { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"

import Modal from "../common/Modal"
import Button from "../common/Button"
import { closeShortcutModal } from "@state/actions/modals"
import { saveShortcut } from "@state/actions/enviroment/shortcuts"
import Kbd from "@components/common/Kbd"

const key2string = require("key-event-to-string")()

const ShortcutModal = () => {
    const { shortcutNamespace, shortcutKey, keymap } = useSelector(
        state => state.env
    )
    const [shortcut, setShortcut] = useState(
        keymap[shortcutNamespace][shortcutKey]
    )
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
    }

    return (
        <Modal
            show={true}
            showCloseButton={true}
            onClose={() => closeShortcutModal()}
        >
            {/* {editorRef && editorRef.current && (
                <small>
                    {editorRef.current.hasFocus()
                        ? "Type on the keyboard the new shortcut"
                        : "Click on the area below to change shortcut"
                    }
                </small>
            )} */}
            <div
                ref={editorRef}
                className="shortcut-preview-container"
                tabIndex={0}
                onClick={focusEditor}
                onKeyDown={handleKeyDown}
            >
                {shortcut && (
                    <Kbd className="shortcut-preview" shortcut={shortcut} />
                )}
            </div>
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
                >
                    Save
                </Button>
            </div>
        </Modal>
    )
}

export default ShortcutModal
