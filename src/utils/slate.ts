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

import markdown from "remark-parse"
import slate, { serialize } from "remark-slate"
import { Editor, Element, Text, Transforms } from "slate"
import { unified } from "unified"

import type { InputNodeTypes, NodeTypes } from "remark-slate"
import type { BaseEditor, BaseRange, Descendant, Node, NodeEntry } from "slate"
import type { ReactEditor } from "slate-react"

export type SlateDescendant = SlateElement | SlateText

export type SlateElementType =
  | (typeof BLOCK_TEXT_TYPES)[number]
  | (typeof INLINE_TEXT_TYPES)[number]

export type SlateElement<T = SlateElementType> = Omit<Element, "children"> & {
  type: T
  align?: TextAlignment
  url?: string
  children: (SlateElement | SlateText)[]
}

export type SlateText = Text & SlateTextProps

export type SlateTextProps = {
  bold?: boolean
  code?: boolean
  italic?: boolean
  underline?: boolean
  striketrough?: boolean
  link?: boolean
  size?: number
}

export type TextLeaf = Partial<keyof SlateTextProps>

export type ElementBlockType = Exclude<keyof SlateElement, "children">

export type TextAlignment = (typeof TEXT_ALIGN_TYPES)[number]

export const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"] as const

export const BLOCK_TEXT_TYPES = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ol",
  "ul",
  "li",
  "code",
] as const

export const INLINE_TEXT_TYPES = ["a"] as const

export const HOTKEYS: Record<string, TextLeaf> = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
}

export const isSlateElement = (node: Descendant): node is SlateElement => {
  return Element.isElement(node)
}

export const toggleMark = (editor: BaseEditor, format: TextLeaf) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const isMarkActive = (editor: BaseEditor, format: TextLeaf) => {
  const marks = Editor.marks(editor)
  return marks ? (marks as any)[format] === true : false
}

export type inferBlockTypeValue<T> = T extends "type"
  ? SlateElementType
  : T extends "align"
    ? TextAlignment
    : never

export const toggleBlock = (editor: BaseEditor, blockType: ElementBlockType, value: string) => {
  const isActive = isBlockActive(editor, blockType, value)

  if (blockType === "align") {
    Transforms.setNodes<SlateElement>(editor, {
      align: isActive ? undefined : (value as TextAlignment),
    })
  } else if (blockType === "type") {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && isSlateElement(n) && n.type === value,
      split: true,
    })

    if (["ol", "ul"].includes(value)) {
      Transforms.setNodes<SlateElement>(editor, {
        type: isActive ? "p" : "li",
      })
    }

    if (!isActive) {
      const block = { type: value, children: [] }
      Transforms.wrapNodes(editor, block)
    }
  }
}

export const isBlockActive = (editor: BaseEditor, blockType: ElementBlockType, value: string) => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => !Editor.isEditor(n) && isSlateElement(n) && n[blockType] === value,
    })
  )

  return !!match
}

const markdownNodeType: InputNodeTypes = {
  heading: {
    "1": "h1",
    "2": "h2",
    "3": "h3",
    "4": "h4",
    "5": "h5",
    "6": "h6",
  },
  block_quote: "blockquote",
  code_block: "code",
  image: "img",
  link: "a",
  ol_list: "ol",
  ul_list: "ul",
  listItem: "li",
  paragraph: "p",
  delete_mark: "strikethrough",
  strong_mark: "bold",
  inline_code_mark: "code",
  emphasis_mark: "italic",
  thematic_break: "hr",
}

export const markdownToSlate = async (markdownText: string): Promise<SlateDescendant[]> => {
  let value: SlateDescendant[] = []

  const lines = markdownText.split("\n")

  for (const line of lines) {
    const lineResult = await unified()
      .use(markdown)
      .use(slate, { nodeTypes: markdownNodeType })
      .process(line)
    value = [...value, ...(lineResult.result as any)]
  }

  return value
}

export const slateToMarkdown = (value: Descendant[]): string => {
  const markdown = value
    .map(v =>
      serialize(v as any, {
        nodeTypes: markdownNodeType as NodeTypes,
        ignoreParagraphNewline: true,
      })
    )
    .join("")
    .replace(/(\r\n|\n|\r)$/m, "")

  return markdown
}

export const withExtra = (editor: ReactEditor) => {
  const { isInline } = editor

  editor.isInline = element => {
    if (isSlateElement(element)) {
      return element.type === "a"
    }
    return isInline(element)
  }

  return editor
}

export const decorate = (match: NodeEntry<Node>): BaseRange[] => {
  const ranges: BaseRange[] = []

  const [node, path] = match

  if (!Text.isText(node)) {
    return ranges
  }

  const isUrl = (string: string) => {
    try {
      return !!new URL(string)
    } catch {
      return false
    }
  }

  const tokens = node.text.split(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g
  )

  let start = 0

  for (const token of tokens) {
    const length = token.length
    const end = start + length

    if (isUrl(token)) {
      ranges.push({
        link: true,
        anchor: { path, offset: start },
        focus: { path, offset: end },
      } as any)
    }

    start = end
  }

  return ranges
}
