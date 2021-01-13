import React from "react"
import classnames from "classnames"
import ReactMarkdown from "react-markdown"
import gfm from "remark-gfm"

import "./markdown-preview.scss"

type MarkdownPreviewProps = {
  value: string
  disableHeading?: boolean
}

const MarkdownPreview = ({ value, disableHeading }: MarkdownPreviewProps) => {
  return (
    <div className={classnames("markdown-preview", { "no-heading": disableHeading })}>
      <ReactMarkdown
        plugins={[gfm]}
        children={value}
      />
    </div>
  )
}

export default MarkdownPreview
