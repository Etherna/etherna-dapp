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

import React, { useEffect, useMemo, useRef, useState } from "react"
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
import type { EditorProps } from "draft-js"

import "@styles/overrides/draft-js.scss"
import classes from "@styles/components/common/MarkdownEditor.module.scss"
import textfieldClasses from "@styles/components/common/TextField.module.scss"

import MarkdownEditorButton, { MarkdownButtonConfig } from "./MarkdownEditorButton"
import Label from "@common/Label"

const EditorFix = Editor as unknown as React.FC<EditorProps>

type MarkdownEditorProps = {
  id?: string
  value: string | null | undefined
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
    const rawData = markdownToDraft(value ?? "")
    const contentState = convertFromRaw(rawData)
    const newEditorState = EditorState.createWithContent(contentState)
    return newEditorState
  })
  const previousValue = useRef(!value)
  const textLength = useMemo(() => {
    return state.getCurrentContent().getPlainText("").length
  }, [state])

  useEffect(() => {
    if (value === "") {
      // reset state
      setState(EditorState.createEmpty())
      setMarkdown(value)
    }
    else if (value && !previousValue.current) {
      previousValue.current = true
      setState(() => {
        const rawData = markdownToDraft(value)
        const contentState = convertFromRaw(rawData)
        const newEditorState = EditorState.createWithContent(contentState)
        return newEditorState
      })
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
      <div className={classNames(classes.markdownEditor, {
        [classes.focused]: hasFocus,
        [classes.charlimit]: !!charactersLimit
      })}>
        <div className={classes.markdownEditorToolbar}>
          {Object.keys(toolbarConfig).map(key => (
            <div className={classes.markdownEditorBtnGroup} key={key}>
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

        <div className={classes.markdownEditorContent}>
          <EditorFix
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
        </div>

        {charactersLimit && (
          <span className={classNames(textfieldClasses.textFieldCharCounter, {
            [textfieldClasses.limitReached]: textLength === charactersLimit
          })}>
            {textLength}/{charactersLimit}
          </span>
        )}
      </div>
    </>
  )
}

export default MarkdownEditor
