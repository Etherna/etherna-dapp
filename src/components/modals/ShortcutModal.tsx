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

import React, { useEffect, useState, useRef } from "react"
import classNames from "classnames"

import classes from "@styles/components/modals/ShortcutModal.module.scss"
import { ReactComponent as WarningIcon } from "@assets/icons/warning.svg"

import Modal from "@components/common/Modal"
import Button from "@components/common/Button"
import Kbd from "@components/common/Kbd"
import { closeShortcutModal } from "@state/actions/modals"
import { saveShortcut, shortcutExists } from "@state/actions/enviroment/shortcuts"
import useSelector from "@state/useSelector"
import { keyEventToString } from "@utils/keyboard"


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

    const shortcut = keyEventToString(e.nativeEvent)
    setShortcut(shortcut)
    setExistingShortcut(!!shortcutExists(shortcut))
  }

  return (
    <Modal
      show={show}
      showCloseButton={true}
      footerButtons={
        <>
          <Button modifier="danger" onClick={deleteShortcut}>
            Delete
          </Button>
          <Button
            modifier="muted"
            onClick={overrideShortcut}
            disabled={!!existingShortcut}
          >
            Save
          </Button>
        </>
      }
      onClose={() => closeShortcutModal()}
    >
      <div
        ref={editorRef}
        className={classNames(classes.shortcutPreviewContainer, {
          [classes.shortcutError]: existingShortcut,
        })}
        tabIndex={0}
        onClick={focusEditor}
        onKeyDown={handleKeyDown}
      >
        {shortcut && <Kbd className={classes.shortcutPreview} shortcut={shortcut} />}
      </div>
      {existingShortcut && (
        <div className="flex items-center my-4">
          <WarningIcon className="mr-2" width="16" />
          <span>
            Shortcut already set for: <strong>{lang.get(`player.${existingShortcut}`)}</strong>
          </span>
        </div>
      )}
    </Modal>
  )
}

export default ShortcutModal
