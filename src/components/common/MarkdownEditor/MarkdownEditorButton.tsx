import React from "react"
import classnames from "classnames"
import { EditorState, RichUtils } from "draft-js"

import { ReactComponent as BoldIcon } from "@svg/icons/rte/bold.svg"
import { ReactComponent as ItalicIcon } from "@svg/icons/rte/italic.svg"
import { ReactComponent as UnderlineIcon } from "@svg/icons/rte/underline.svg"
import { ReactComponent as StrikethroughIcon } from "@svg/icons/rte/strikethrough.svg"
import { ReactComponent as CodeIcon } from "@svg/icons/rte/code.svg"
import { ReactComponent as CodeBlockIcon } from "@svg/icons/rte/code-block.svg"
import { ReactComponent as AlignRightIcon } from "@svg/icons/rte/align-right.svg"
import { ReactComponent as AlignLeftIcon } from "@svg/icons/rte/align-left.svg"
import { ReactComponent as AlignCenterIcon } from "@svg/icons/rte/align-center.svg"
import { ReactComponent as AlignJustifiedIcon } from "@svg/icons/rte/align-justified.svg"
import { ReactComponent as UnorderedListIconIcon } from "@svg/icons/rte/unordered-list.svg"
import { ReactComponent as OrderedListIconIcon } from "@svg/icons/rte/ordered-list.svg"

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
      className={classnames("markdown-editor-btn", {
        active
      })}
      title={config.label}
      onClick={toggleStyle}
    >
      {getIcon()}
    </button>
  )
}

export default MarkdownEditorButton
