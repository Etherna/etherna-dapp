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
import classNames from "classnames"
import { EditorState, RichUtils } from "draft-js"

import classes from "@styles/components/common/MarkdownEditorButton.module.scss"
import { ReactComponent as BoldIcon } from "@assets/icons/rte/bold.svg"
import { ReactComponent as ItalicIcon } from "@assets/icons/rte/italic.svg"
import { ReactComponent as UnderlineIcon } from "@assets/icons/rte/underline.svg"
import { ReactComponent as StrikethroughIcon } from "@assets/icons/rte/strikethrough.svg"
import { ReactComponent as CodeIcon } from "@assets/icons/rte/code.svg"
import { ReactComponent as CodeBlockIcon } from "@assets/icons/rte/code-block.svg"
import { ReactComponent as AlignRightIcon } from "@assets/icons/rte/align-right.svg"
import { ReactComponent as AlignLeftIcon } from "@assets/icons/rte/align-left.svg"
import { ReactComponent as AlignCenterIcon } from "@assets/icons/rte/align-center.svg"
import { ReactComponent as AlignJustifiedIcon } from "@assets/icons/rte/align-justified.svg"
import { ReactComponent as UnorderedListIconIcon } from "@assets/icons/rte/unordered-list.svg"
import { ReactComponent as OrderedListIconIcon } from "@assets/icons/rte/ordered-list.svg"

export type MarkdownButtonConfig = {
  label?: string
} & ({
  type: "block"
  style:
  "header-one" |
  "header-two" |
  "header-three" |
  "header-four" |
  "header-five" |
  "header-six" |
  "blockquote" |
  "unordered-list-item" |
  "ordered-list-item" |
  "code-block" |
  "ALIGN_LEFT" |
  "ALIGN_CENTER" |
  "ALIGN_RIGHT" |
  "ALIGN_JUSTIFY"
} | {
  type: "inline"
  style: "BOLD" | "ITALIC" | "UNDERLINE" | "CODE" | "STRIKETHROUGH"
})

type MarkdownEditorButtonProps = {
  editorState: EditorState
  config: MarkdownButtonConfig
  onEditorStateChange?(editorState: EditorState): void
}

const MarkdownEditorButton: React.FC<MarkdownEditorButtonProps> = ({
  editorState,
  config,
  onEditorStateChange
}) => {
  const selection = editorState.getSelection()
  const blockType = config.type === "block" && editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()
  const inlineStyle = config.type === "inline" ? editorState.getCurrentInlineStyle() : null
  const active =
    (config.type === "block" && blockType === config.style) ||
    (config.type === "inline" && inlineStyle!.has(config.style))

  const toggleStyle = () => {
    if (config.type === "inline") {
      onEditorStateChange?.(
        RichUtils.toggleInlineStyle(
          editorState,
          config.style
        )
      )
    }
    if (config.type === "block") {
      onEditorStateChange?.(
        RichUtils.toggleBlockType(
          editorState,
          config.style
        )
      )
    }
  }

  const getIcon = () => {
    switch (config.style) {
      case "BOLD": return <BoldIcon />
      case "ITALIC": return <ItalicIcon />
      case "UNDERLINE": return <UnderlineIcon />
      case "STRIKETHROUGH": return <StrikethroughIcon />
      case "CODE": return <CodeIcon />
      case "ALIGN_RIGHT": return <AlignRightIcon />
      case "ALIGN_LEFT": return <AlignLeftIcon />
      case "ALIGN_CENTER": return <AlignCenterIcon />
      case "ALIGN_JUSTIFY": return <AlignJustifiedIcon />
      case "code-block": return <CodeBlockIcon />
      case "unordered-list-item": return <UnorderedListIconIcon />
      case "ordered-list-item": return <OrderedListIconIcon />
    }
  }

  return (
    <button
      className={classNames(classes.markdownEditorBtn, {
        [classes.active]: active
      })}
      title={config.label}
      onClick={toggleStyle}
    >
      {getIcon()}
    </button>
  )
}

export default MarkdownEditorButton
