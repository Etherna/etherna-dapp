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

import React, { useEffect, useState } from "react"
import Editor, { EditorValue, ToolbarConfig } from "react-rte"

import "./markdown-editor.scss"

type MarkdownEditorProps = {
  value: string
  placeholder?: string
  disabled?: boolean
  onChange?: (markdown: string) => void
}

const MarkdownEditor = ({
  value,
  placeholder,
  disabled,
  onChange,
}: MarkdownEditorProps) => {
  const [state, setState] = useState(Editor.createValueFromString(value, "markdown"))

  useEffect(() => {
    if (value === "") {
      setState(Editor.createValueFromString(value, "markdown"))
    }
  }, [value])

  const handleChange = (newValue?: EditorValue) => {
    if (!newValue) return

    setState(newValue)

    if (onChange) {
      onChange(newValue.toString("markdown"))
    }
  }

  const toolbarConfig: ToolbarConfig = {
    // Optionally specify the groups to display (displayed in the order listed).
    display: [
      "INLINE_STYLE_BUTTONS",
      "BLOCK_ALIGNMENT_BUTTONS",
      "BLOCK_TYPE_BUTTONS",
      "LINK_BUTTONS",
      "BLOCK_TYPE_DROPDOWN",
      "HISTORY_BUTTONS"
    ],
    INLINE_STYLE_BUTTONS: [
      { label: "Bold", style: "BOLD" },
      { label: "Italic", style: "ITALIC" },
      { label: "Strikethrough", style: "STRIKETHROUGH" },
      { label: "Code", style: "CODE" },
      { label: "Underline", style: "UNDERLINE" },
    ],
    BLOCK_ALIGNMENT_BUTTONS: [
      { label: "Align Left", style: "ALIGN_LEFT" },
      { label: "Align Center", style: "ALIGN_CENTER" },
      { label: "Align Right", style: "ALIGN_RIGHT" },
      { label: "Align Justify", style: "ALIGN_JUSTIFY" },
    ],
    BLOCK_TYPE_DROPDOWN: [
      { label: "Normal", style: "unstyled" },
      { label: "Code Block", style: "code-block" },
    ],
    BLOCK_TYPE_BUTTONS: [
      { label: "UL", style: "unordered-list-item" },
      { label: "OL", style: "ordered-list-item" }
    ]
  }

  return (
    <div className="markdown-editor">
      <Editor
        placeholder={placeholder}
        toolbarConfig={toolbarConfig}

        value={state}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}

export default MarkdownEditor
