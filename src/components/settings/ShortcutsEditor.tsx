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

import React from "react"

import { BackspaceIcon } from "@heroicons/react/24/outline"
import { PencilIcon } from "@heroicons/react/24/solid"

import { Button } from "@/components/ui/actions"
import { Kbd } from "@/components/ui/display"
import type { KeymapNamespace } from "@/definitions/keyboard"
import {
  editShortcut,
  resetShortcut,
  hasCustomShortcut,
} from "@/state/actions/enviroment/shortcuts"
import useSelector from "@/state/useSelector"
import { splitArray } from "@/utils/array"

type ShortcutsEditorProps = {
  namespace: KeymapNamespace
}

const ShortcutsEditor: React.FC<ShortcutsEditorProps> = ({ namespace }) => {
  const { lang, keymap } = useSelector(state => state.env)
  const { [namespace]: shortcuts } = keymap
  const shortChunks = splitArray(Object.keys(shortcuts), 10)

  return (
    <div className="flex flex-wrap">
      {shortChunks.map((shortcutNames, i) => (
        <table className="w-full md:w-1/2" key={i}>
          <tbody>
            {shortcutNames.map(shortcut => (
              <tr className="w-full [&>td]:py-1" key={shortcut}>
                <td>{lang.get(`player.${shortcut}`)}</td>
                <td>{shortcuts[shortcut] && <Kbd shortcut={shortcuts[shortcut]!} />}</td>
                <td>
                  <div className="flex">
                    <Button
                      color="transparent"
                      aspect="text"
                      onClick={() => editShortcut(namespace, shortcut)}
                      small
                      rounded
                    >
                      <PencilIcon width={16} />
                    </Button>
                  </div>
                </td>
                <td>
                  <div className="flex">
                    <Button
                      color="transparent"
                      aspect="text"
                      disabled={!hasCustomShortcut(namespace, shortcut)}
                      onClick={() => resetShortcut(namespace, shortcut)}
                      small
                      rounded
                    >
                      <BackspaceIcon width={18} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}

export default ShortcutsEditor
