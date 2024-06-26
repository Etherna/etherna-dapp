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

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import isHotkey from "is-hotkey"
import { createEditor, Transforms } from "slate"
import { withHistory } from "slate-history"
import { Editable, Slate, useSlate, withReact } from "slate-react"

import { ReactComponent as BoldIcon } from "@/assets/icons/rte/bold.svg"
import { ReactComponent as CodeBlockIcon } from "@/assets/icons/rte/code-block.svg"
import { ReactComponent as CodeIcon } from "@/assets/icons/rte/code.svg"
import { ReactComponent as ItalicIcon } from "@/assets/icons/rte/italic.svg"
import { ReactComponent as OrderedListIconIcon } from "@/assets/icons/rte/ordered-list.svg"
import { ReactComponent as StrikethroughIcon } from "@/assets/icons/rte/strikethrough.svg"
import { ReactComponent as UnderlineIcon } from "@/assets/icons/rte/underline.svg"
import { ReactComponent as UnorderedListIconIcon } from "@/assets/icons/rte/unordered-list.svg"

import SlateBlock from "./SlateBlock"
import SlateLeaf from "./SlateLeaf"
import { Label } from "@/components/ui/display"
import { TextInput } from "@/components/ui/inputs"
import { cn } from "@/utils/classnames"
import {
  decorate,
  HOTKEYS,
  isBlockActive,
  isMarkActive,
  markdownToSlate,
  slateToMarkdown,
  toggleBlock,
  toggleMark,
  withExtra,
} from "@/utils/slate"

import type { ElementBlockType, inferBlockTypeValue, SlateElement, TextLeaf } from "@/utils/slate"
import type { Descendant } from "slate"

type SlateMarkdownEditorProps = {
  id?: string
  className?: string
  initialValue?: string
  toolbarClassName?: string
  charLimitClassName?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  charactersLimit?: number
  onChange?(markdown: string): void
  onFocus?(): void
  onBlur?(): void
  onCharacterLimitChange?(exeeded: boolean): void
}

type SlateMarkdownEditorRef = {
  reset(): void
}

type ToolbarButtonProps<T = ElementBlockType> = {
  children: React.ReactNode
  mark?: TextLeaf
  blockType?: T
  blockValue?: inferBlockTypeValue<T>
}

const defaultValue: SlateElement[] = [
  {
    type: "p",
    children: [{ text: "" }],
  },
]

const SlateMarkdownEditor = forwardRef<SlateMarkdownEditorRef, SlateMarkdownEditorProps>(
  (
    {
      id,
      className,
      initialValue,
      toolbarClassName,
      charLimitClassName,
      label,
      placeholder,
      disabled,
      charactersLimit,
      onChange,
      onFocus,
      onBlur,
      onCharacterLimitChange,
    },
    ref
  ) => {
    const editor = useMemo(() => withExtra(withHistory(withReact(createEditor()))), [])
    const loaded = useRef(false)
    const [hasFocus, setHasFocus] = useState(false)
    const [charactersCount, setCharactersCount] = useState(0)
    const [hasExceededLimit, setHasExceededLimit] = useState(false)

    const safeMarkdown = useCallback(
      (markdown: string) => {
        if (charactersLimit) {
          return markdown.slice(0, charactersLimit)
        }
        return markdown
      },
      [charactersLimit]
    )

    const resetEditor = useCallback(() => {
      editor.children = defaultValue
      editor.normalizeNode([editor, []])
      Transforms.setSelection(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      })
    }, [editor])

    const updateCharactersCount = useCallback(
      (markdown: string) => {
        const lengthWithoutNewLines = markdown.replace(/\n/g, "").length
        setCharactersCount(lengthWithoutNewLines)

        if (charactersLimit) {
          setHasExceededLimit(lengthWithoutNewLines > charactersLimit)
          onCharacterLimitChange?.(lengthWithoutNewLines > charactersLimit)
        }
      },
      [charactersLimit, onCharacterLimitChange]
    )

    useEffect(() => {
      if (initialValue && !loaded.current) {
        updateCharactersCount(initialValue)
        // replace content
        markdownToSlate(initialValue).then(value => {
          try {
            Transforms.setSelection(editor, {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 0 },
            })
            editor.children = value
            editor.normalizeNode([editor, []])
          } catch (error) {}
        })

        loaded.current = true
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue, editor])

    const handleChange = useCallback(
      (val: Descendant[]) => {
        const markdown = slateToMarkdown(val)
        updateCharactersCount(markdown)
        onChange?.(safeMarkdown(markdown))
      },
      [onChange, updateCharactersCount, safeMarkdown]
    )

    const onContainerClick = useCallback((e: React.MouseEvent) => {
      // e.target === e.currentTarget && Transforms.select(editor, { offset: 0, path: [0, 0] })
    }, [])

    const renderElement = useCallback((props: any) => <SlateBlock {...props} />, [])

    const renderLeaf = useCallback((props: any) => <SlateLeaf {...props} />, [])

    useImperativeHandle(ref, () => ({
      reset: () => {
        resetEditor()
      },
    }))

    return (
      <div className={cn(className)}>
        {label && <Label htmlFor={id}>{label}</Label>}

        <div
          className={cn(
            "relative block w-full appearance-none rounded-lg border leading-tight",
            "min-h-24 px-3 py-3",
            "border-gray-200 bg-gray-400/5 text-gray-700",
            "dark:border-gray-800 dark:bg-gray-100/5 dark:text-gray-200",
            {
              "border-green-500 outline-none dark:border-green-500": hasFocus,
              "bg-transparent dark:bg-transparent dark:text-gray-200": hasFocus,
              "border-red-500 dark:border-red-500": hasExceededLimit,
              "pb-10": !!charactersLimit,
            }
          )}
          onClick={onContainerClick}
          data-editor
        >
          <Slate editor={editor} initialValue={defaultValue} onChange={handleChange}>
            <div
              className={cn(
                "mb-4 flex items-center space-x-4 border-b border-gray-200 pb-4 dark:border-gray-700",
                toolbarClassName
              )}
            >
              <div className="space-x-1">
                <ToolbarButton mark="bold">
                  <BoldIcon width={16} />
                </ToolbarButton>
                <ToolbarButton mark="italic">
                  <ItalicIcon width={16} />
                </ToolbarButton>
                <ToolbarButton mark="underline">
                  <UnderlineIcon width={16} />
                </ToolbarButton>
                <ToolbarButton mark="striketrough">
                  <StrikethroughIcon width={16} />
                </ToolbarButton>
                <ToolbarButton mark="code">
                  <CodeIcon width={16} />
                </ToolbarButton>
              </div>
              <div className="space-x-1">
                <ToolbarButton blockType="type" blockValue="ol">
                  <OrderedListIconIcon width={16} />
                </ToolbarButton>
                <ToolbarButton blockType="type" blockValue="ul">
                  <UnorderedListIconIcon width={16} />
                </ToolbarButton>
                <ToolbarButton blockType="type" blockValue="code">
                  <CodeBlockIcon width={16} />
                </ToolbarButton>
              </div>
            </div>

            <Editable
              id={id}
              className="font-normal focus-visible:outline-none [&>*+*]:mt-2"
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              decorate={decorate}
              placeholder={placeholder}
              spellCheck
              onFocus={() => {
                setHasFocus(true)
                onFocus?.()
              }}
              onBlur={() => {
                setHasFocus(false)
                onBlur?.()
              }}
              onKeyDown={event => {
                for (const hotkey in HOTKEYS) {
                  if (isHotkey(hotkey, event as any)) {
                    event.preventDefault()
                    event.stopPropagation()
                    const mark = HOTKEYS[hotkey]!
                    toggleMark(editor, mark)
                  }
                }
              }}
              disabled={disabled}
            />
          </Slate>

          {charactersLimit && (
            <TextInput.CharactersLimit
              className={charLimitClassName}
              textLength={charactersCount}
              limit={charactersLimit}
            />
          )}
        </div>
      </div>
    )
  }
)

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ children, blockType, blockValue, mark }) => {
  const editor = useSlate()

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      mark && toggleMark(editor, mark!)
      blockType && toggleBlock(editor, blockType, blockValue!)
    },
    [editor, blockType, blockValue, mark]
  )

  const isActive = mark
    ? isMarkActive(editor, mark)
    : blockType
      ? isBlockActive(editor, blockType, blockValue!)
      : false

  return (
    <button
      className={cn("rounded p-1.5", {
        "bg-gray-400/20 dark:bg-gray-500/20": isActive,
      })}
      type="button"
      onMouseDown={handleToggle}
    >
      {children}
    </button>
  )
}

export default SlateMarkdownEditor
