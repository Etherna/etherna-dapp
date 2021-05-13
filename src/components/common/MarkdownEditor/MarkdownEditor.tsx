import React, { useEffect, useState } from "react"
import classnames from "classnames"
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

type MarkdownEditorProps = {
  value: string
  placeholder?: string
  disabled?: boolean
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
  value,
  placeholder,
  disabled,
  onChange,
}) => {
  const [markdown, setMarkdown] = useState(value)
  const [state, setState] = useState<EditorState>(() => {
    const rawData = markdownToDraft(value)
    const contentState = convertFromRaw(rawData)
    const newEditorState = EditorState.createWithContent(contentState)
    return newEditorState
  })
  const [hasFocus, setHasFocus] = useState(false)

  useEffect(() => {
    if (value === "") {
      // reset state
      setState(EditorState.createEmpty())
      setMarkdown(value)
    }
  }, [value])

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

  const handleKeyCommand = (command: DraftEditorCommand, editorState: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      setState(newState)
      return "handled"
    }

    return "not-handled"
  }

  return (
    <div className={classnames("markdown-editor", { focused: hasFocus })}>
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
        handleKeyCommand={handleKeyCommand}
        onChange={handleChange}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        readOnly={disabled}
        spellCheck
      />
    </div>
  )
}

export default MarkdownEditor
