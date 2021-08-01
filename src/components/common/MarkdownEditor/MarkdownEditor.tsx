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

import React, { useEffect, useMemo, useState } from "react"
import classNames from "classnames"
import {
  Editor,
  EditorState,
  RichUtils,
  DraftHandleValue,
  DraftEditorCommand,
  convertFromRaw,
  convertToRaw
} from "draft-js"
import { draftToMarkdown, markdownToDraft } from "markdown-draft-js"

import "./markdown-editor.scss"
import MarkdownEditorButton, { MarkdownButtonConfig } from "./MarkdownEditorButton"
import Label from "@common/Label"

type MarkdownEditorProps = {
  id?: string
  value: string
  label?: string
  placeholder?: string
  disabled?: boolean
  charactersLimit?: number
  onChange?(markdown: string): void
}

type ToolbarConfig = {
  [key: string]: MarkdownButtonConfig[]
}

const toolbarConfig: ToolbarConfig = {
  INLINE_STYLE_BUTTONS: [
    { label: "Bold", type: "inline", style: "BOLD" },
    { label: "Italic", type: "inline", style: "ITALIC" },
    { label: "Underline", type: "inline", style: "UNDERLINE" },
    { label: "Strikethrough", type: "inline", style: "STRIKETHROUGH" },
    { label: "Code", type: "inline", style: "CODE" },
  ],
  BLOCK_ALIGNMENT_BUTTONS: [
    { label: "Align Left", type: "block", style: "ALIGN_LEFT" },
    { label: "Align Center", type: "block", style: "ALIGN_CENTER" },
    { label: "Align Right", type: "block", style: "ALIGN_RIGHT" },
    { label: "Align Justify", type: "block", style: "ALIGN_JUSTIFY" },
  ],
  BLOCK_TYPE_BUTTONS: [
    { label: "Unordered list", type: "block", style: "unordered-list-item" },
    { label: "Ordered list", type: "block", style: "ordered-list-item" },
    { label: "Code block", type: "block", style: "code-block" }
  ]
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  id,
  value,
  label,
  placeholder,
  charactersLimit,
  disabled,
  onChange,
}) => {
  const [markdown, setMarkdown] = useState(value)
  const [hasFocus, setHasFocus] = useState(false)
  const [state, setState] = useState<EditorState>(() => {
    const rawData = markdownToDraft(value)
    const contentState = convertFromRaw(rawData)
    const newEditorState = EditorState.createWithContent(contentState)
    return newEditorState
  })
  const textLength = useMemo(() => {
    return state.getCurrentContent().getPlainText("").length
  }, [state])

  useEffect(() => {
    if (value === "") {
      // reset state
      setState(EditorState.createEmpty())
      setMarkdown(value)
    }
  }, [value])

  const handleBeforeInput = (chars: string, editorState: EditorState, eventTimeStamp: number) => {
    const currentContent = editorState.getCurrentContent()
    const currentContentLength = currentContent.getPlainText("").length

    if (charactersLimit && currentContentLength > charactersLimit - 1) {
      return "handled"
    }

    return "not-handled"
  }

  const handleKeyCommand = (command: DraftEditorCommand, editorState: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      setState(newState)
      return "handled"
    }

    return "not-handled"
  }

  const handleChange = (editorState: EditorState) => {
    setState(editorState)

    const content = editorState.getCurrentContent()
    const rawObject = convertToRaw(content)
    const markdownString = draftToMarkdown(rawObject)

    if (markdownString !== markdown) {
      setMarkdown(markdownString)
      onChange?.(markdownString)
    }
  }

  return (
    <>
      {label && (
        <Label htmlFor={id}>{label}</Label>
      )}
      <div className={classNames("markdown-editor", { focused: hasFocus, charlimit: !!charactersLimit })}>
        <div className="markdown-editor-toolbar">
          {Object.keys(toolbarConfig).map(key => (
            <div className="markdown-editor-btn-group" key={key}>
              {toolbarConfig[key].map((btnConfig, i) => (
                <MarkdownEditorButton
                  editorState={state}
                  config={btnConfig}
                  onEditorStateChange={handleChange}
                  key={i}
                />
              ))}
            </div>
          ))}
        </div>

        <Editor
          placeholder={placeholder}
          editorState={state}
          handleBeforeInput={handleBeforeInput}
          handleKeyCommand={handleKeyCommand}
          onChange={handleChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          readOnly={disabled}
          spellCheck
        />

        {charactersLimit && (
          <span className={classNames("text-field-char-counter", {
            "limit-reached": textLength === charactersLimit
          })}>
            {textLength}/{charactersLimit}
          </span>
        )}
      </div>
    </>
  )
}

export default MarkdownEditor
