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

import "./shortcuts.scss"

import { ReactComponent as EditIcon } from "@svg/icons/edit.svg"
import { ReactComponent as ResetIcon } from "@svg/icons/reset.svg"

import Button from "@common/Button"
import Kbd from "@common/Kbd"
import { KeymapNamespace } from "@keyboard/typings"
import { editShortcut, resetShortcut, hasCustomShortcut } from "@state/actions/enviroment/shortcuts"
import useSelector from "@state/useSelector"
import { splitArray } from "@utils/arrays"

type ShortcutsEditorProps = {
  namespace: KeymapNamespace
}

const ShortcutsEditor = ({ namespace }: ShortcutsEditorProps) => {
  const { lang, keymap } = useSelector(state => state.env)
  const { [namespace]: shortcuts } = keymap
  const shortChunks = splitArray(Object.keys(shortcuts), 10)

  return (
    <div className="shortcuts-table-container">
      {shortChunks.map((shortcutNames, i) => (
        <table className="shortcuts-table" key={i}>
          <tbody>
            {shortcutNames.map(shortcut => (
              <tr key={shortcut}>
                <td>{lang.get(`player.${shortcut}`)}</td>
                <td>
                  <Kbd shortcut={shortcuts[shortcut]!} />
                </td>
                <td>
                  <div className="flex">
                    <Button
                      aspect="transparent"
                      size="small"
                      rounded={true}
                      action={() => editShortcut(namespace, shortcut)}
                    >
                      <div className="m-auto">
                        <EditIcon />
                      </div>
                    </Button>
                  </div>
                </td>
                <td>
                  <div className="flex">
                    <Button
                      aspect="transparent"
                      size="small"
                      rounded={true}
                      disabled={!hasCustomShortcut(namespace, shortcut)}
                      action={() => resetShortcut(namespace, shortcut)}
                    >
                      <div className="m-auto">
                        <ResetIcon />
                      </div>
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
