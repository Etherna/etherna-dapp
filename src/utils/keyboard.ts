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
