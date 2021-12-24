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
 */

const keyMap: Record<number, string> = {
  8: "Backspace",
  9: "Tab",
  13: "Enter",
  27: "Escape",
  32: "Space",
  36: "Home",
  33: "Page Up",
  34: "Page Down",
  35: "End",
  37: "Left",
  38: "Up",
  39: "Right",
  40: "Down",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  192: "`",
  222: "'"
}

/**
 * Get a keystroke readable string
 * 
 * @param e Kyboard event
 * @returns The keyboard readable string
 */
export const keyEventToString = (e: KeyboardEvent) => {
  const result: string[] = []
  const isModifier = [16, 17, 18, 91, 93, 224].includes(e.keyCode)
  const character = isModifier ? null : keyMap[e.keyCode] || String.fromCharCode(e.keyCode)

  if (e.metaKey) result.push("Cmd")
  if (e.ctrlKey) result.push("Ctrl")
  if (e.altKey) result.push("Alt")
  if (e.shiftKey) result.push("Shift")
  if (character) result.push(character)

  return result.join(" + ")
}
