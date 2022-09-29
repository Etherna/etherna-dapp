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

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import classNames from "classnames"
import { Editor, EditorState, RichUtils, convertFromRaw, convertToRaw } from "draft-js"
import type { DraftEditorCommand, DraftHandleValue, EditorProps } from "draft-js"
import { draftToMarkdown, markdownToDraft } from "markdown-draft-js"

import { ReactComponent as BoldIcon } from "@/assets/icons/rte/bold.svg"
import { ReactComponent as CodeBlockIcon } from "@/assets/icons/rte/code-block.svg"
import { ReactComponent as CodeIcon } from "@/assets/icons/rte/code.svg"
import { ReactComponent as ItalicIcon } from "@/assets/icons/rte/italic.svg"
import { ReactComponent as OrderedListIconIcon } from "@/assets/icons/rte/ordered-list.svg"
import { ReactComponent as StrikethroughIcon } from "@/assets/icons/rte/strikethrough.svg"
import { ReactComponent as UnderlineIcon } from "@/assets/icons/rte/underline.svg"
import { ReactComponent as UnorderedListIconIcon } from "@/assets/icons/rte/unordered-list.svg"

import "@/styles/overrides/draft-js.scss"

import { Label } from "@/components/ui/display"
import { TextInput } from "@/components/ui/inputs"

const EditorFix = Editor as unknown as React.FC<EditorProps>

type MarkdownEditorProps = {
  id?: string
  className?: string
  toolbarClassName?: string
  charLimitClassName?: string
  value: string | null | undefined
  label?: string
  placeholder?: string
  disabled?: boolean
  charactersLimit?: number
  onChange?(markdown: string): void
  onFocus?(): void
  onBlur?(): void
  onCharacterLimitChange?(exeeded: boolean): void
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
    { label: "Code block", type: "block", style: "code-block" },
  ],
}
type MarkdownButtonConfig = {
  label?: string
} & (
  | {
      type: "block"
      style:
        | "header-one"
        | "header-two"
        | "header-three"
        | "header-four"
        | "header-five"
        | "header-six"
        | "blockquote"
        | "unordered-list-item"
        | "ordered-list-item"
        | "code-block"
    }
  | {
      type: "inline"
      style: "BOLD" | "ITALIC" | "UNDERLINE" | "CODE" | "STRIKETHROUGH"
    }
)

type MarkdownEditorButtonProps = {
  editorState: EditorState
  config: MarkdownButtonConfig
  onEditorStateChange?(editorState: EditorState): void
}

const MarkdownEditorButton: React.FC<MarkdownEditorButtonProps> = ({
  editorState,
  config,
  onEditorStateChange,
}) => {
  const selection = editorState.getSelection()
  const blockType =
    config.type === "block" &&
    editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType()
  const inlineStyle = config.type === "inline" ? editorState.getCurrentInlineStyle() : null
  const active =
    (config.type === "block" && blockType === config.style) ||
    (config.type === "inline" && inlineStyle!.has(config.style))

  const toggleStyle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      if (config.type === "inline") {
        onEditorStateChange?.(RichUtils.toggleInlineStyle(editorState, config.style))
      }
      if (config.type === "block") {
        onEditorStateChange?.(RichUtils.toggleBlockType(editorState, config.style))
      }
    },
    [config.style, config.type, editorState, onEditorStateChange]
  )

  const getIcon = useCallback(() => {
    switch (config.style) {
      case "BOLD":
        return <BoldIcon width={20} />
      case "ITALIC":
        return <ItalicIcon width={20} />
      case "UNDERLINE":
        return <UnderlineIcon width={20} />
      case "STRIKETHROUGH":
        return <StrikethroughIcon width={20} />
      case "CODE":
        return <CodeIcon width={20} />
      case "code-block":
        return <CodeBlockIcon width={20} />
      case "unordered-list-item":
        return <UnorderedListIconIcon width={20} />
      case "ordered-list-item":
        return <OrderedListIconIcon width={20} />
    }
  }, [config.style])

  return (
    <div
      className={classNames(
        "flex h-8 w-8 cursor-pointer appearance-none items-center justify-center",
        "text-gray-700 dark:text-gray-400",
        {
          "hover:bg-gray-100 dark:hover:bg-gray-800": !active,
          "bg-gray-100 text-blue-400 dark:bg-gray-800": active,
        }
      )}
      title={config.label}
      onMouseDown={toggleStyle}
    >
      {getIcon()}
    </div>
  )
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  id,
  className,
  toolbarClassName,
  charLimitClassName,
  value,
  label,
  placeholder,
  charactersLimit,
  disabled,
  onChange,
  onFocus,
  onBlur,
  onCharacterLimitChange,
}) => {
  const [markdown, setMarkdown] = useState(value)
  const [hasFocus, setHasFocus] = useState(false)
  const [hasExceededLimit, setHasExceededLimit] = useState(false)
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
    } else if (value && !previousValue.current) {
      previousValue.current = true
      setState(() => {
        const rawData = markdownToDraft(value)
        const contentState = convertFromRaw(rawData)
        const newEditorState = EditorState.createWithContent(contentState)
        return newEditorState
      })
    }
  }, [value])

  useEffect(() => {
    if (!charactersLimit) return
    setHasExceededLimit((value?.length ?? 0) >= charactersLimit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, charactersLimit])

  useEffect(() => {
    onCharacterLimitChange?.(hasExceededLimit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExceededLimit])

  const handleBeforeInput = useCallback(
    (chars: string, editorState: EditorState, eventTimeStamp: number) => {
      const currentContent = editorState.getCurrentContent()
      const currentContentLength = currentContent.getPlainText("").length

      if (charactersLimit && currentContentLength > charactersLimit - 1) {
        return "handled"
      }

      return "not-handled"
    },
    [charactersLimit]
  )

  const handleKeyCommand = useCallback(
    (command: DraftEditorCommand, editorState: EditorState): DraftHandleValue => {
      const newState = RichUtils.handleKeyCommand(editorState, command)

      if (newState) {
        setState(newState)
        return "handled"
      }

      return "not-handled"
    },
    []
  )

  const handleChange = useCallback(
    (editorState: EditorState) => {
      setState(editorState)

      const content = editorState.getCurrentContent()
      const rawObject = convertToRaw(content)
      const markdownString = draftToMarkdown(rawObject)

      if (markdownString !== markdown) {
        setMarkdown(markdownString)
        onChange?.(markdownString)
      }
    },
    [markdown, onChange]
  )

  const handleFocus = useCallback(() => {
    setHasFocus(true)
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    setHasFocus(false)
    onBlur?.()
  }, [onBlur])

  return (
    <>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        className={classNames(
          "relative block w-full appearance-none rounded border leading-tight",
          "border-gray-200 bg-gray-900/5 text-gray-700",
          "dark:border-gray-800 dark:bg-gray-100/5 dark:text-gray-200",
          {
            "border-green-500 bg-transparent outline-none": hasFocus,
            "dark:border-green-500 dark:bg-transparent dark:text-gray-200": hasFocus,
            "pb-8": !!charactersLimit,
          },
          className
        )}
        data-editor
      >
        <div
          className={classNames(
            "flex items-center space-x-4 overflow-x-auto px-3 py-1.5",
            "pointer-events-none scrollbar-none",
            toolbarClassName,
            {
              "pointer-events-auto": hasFocus,
            }
          )}
          data-editor-toolbar
        >
          {Object.keys(toolbarConfig).map(key => (
            <div
              className={classNames(
                "flex items-center overflow-hidden rounded",
                "border border-gray-200 dark:border-gray-700",
                "divide-x divide-gray-200 dark:divide-gray-700"
              )}
              key={key}
            >
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

        <div className="prose max-w-none text-gray-700 dark:text-gray-200">
          <EditorFix
            placeholder={placeholder}
            editorState={state}
            handleBeforeInput={handleBeforeInput}
            handleKeyCommand={handleKeyCommand}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readOnly={disabled}
            spellCheck
          />
        </div>

        {charactersLimit && (
          <TextInput.CharactersLimit
            className={charLimitClassName}
            textLength={value?.length ?? 0}
            limit={charactersLimit}
          />
        )}
      </div>
    </>
  )
}

export default MarkdownEditor
