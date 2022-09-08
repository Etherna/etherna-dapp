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

import React, { useEffect, useState, useRef, useCallback } from "react"
import classNames from "classnames"

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"

import { Button, Modal } from "@/components/ui/actions"
import { Kbd } from "@/components/ui/display"
import { saveShortcut, shortcutExists } from "@/state/actions/enviroment/shortcuts"
import { closeShortcutModal } from "@/state/actions/modals"
import useSelector from "@/state/useSelector"
import { keyEventToString } from "@/utils/keyboard"

type ShortcutModalProsp = {
  show?: boolean
}

const ShortcutModal: React.FC<ShortcutModalProsp> = ({ show = false }) => {
  const { shortcutNamespace, shortcutKey, keymap, lang } = useSelector(state => state.env)
  const [shortcut, setShortcut] = useState<string | null>()
  const [existingShortcut, setExistingShortcut] = useState<string | null>(null)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef])

  const focusEditor = useCallback(() => {
    if (editorRef && editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  const deleteShortcut = useCallback(() => {
    setShortcut(null)
    setExistingShortcut(null)
  }, [])

  const overrideShortcut = useCallback(() => {
    saveShortcut(shortcut)
  }, [shortcut])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const shortcut = keyEventToString(e.nativeEvent)
    setShortcut(shortcut)
    setExistingShortcut(shortcutExists(shortcut))
  }, [])

  return (
    <Modal
      show={show}
      showCloseButton={true}
      footerButtons={
        <>
          <Button color="muted" onClick={overrideShortcut} disabled={!!existingShortcut}>
            Save
          </Button>
          <Button color="error" onClick={deleteShortcut}>
            Clear
          </Button>
        </>
      }
      onClose={() => closeShortcutModal()}
    >
      <div
        ref={editorRef}
        className={classNames(
          "relative my-5 flex w-full rounded-lg p-12",
          "bg-gray-200 dark:bg-gray-800",
          "focus:outline-none focus:ring",
          {
            "border-2 border-red-500": existingShortcut,
          }
        )}
        tabIndex={0}
        onClick={focusEditor}
        onKeyDown={handleKeyDown}
      >
        {shortcut && (
          <Kbd
            className={classNames(
              "pointer-events-none w-full text-center text-6xl text-gray-500 absolute-center",
              "[&>*]:align-baseline [&>*]:leading-none",
              "[&_kbd]:border-b-0"
            )}
            shortcut={shortcut}
          />
        )}
      </div>
      {existingShortcut && (
        <div className="my-4 flex items-center">
          <ExclamationTriangleIcon className="mr-2" width="16" />
          <span>
            Shortcut already set for: <strong>{lang.get(`player.${existingShortcut}`)}</strong>
          </span>
        </div>
      )}
    </Modal>
  )
}

export default ShortcutModal
