import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import ReactMarkdown from "react-markdown"
import gfm from "remark-gfm"

import "./markdown-preview.scss"

const MarkdownPreview = ({ value, disableHeading }) => {
  return (
    <div className={classnames("markdown-preview", { "no-heading": disableHeading })}>
      <ReactMarkdown
        plugins={[gfm]}
        children={value}
      />
    </div>
  )
}

MarkdownPreview.propTypes = {
  value: PropTypes.string.isRequired,
  disableHeading: PropTypes.bool,
}

MarkdownPreview.defaultProps = {
  disableHeading: false
}

export default MarkdownPreview
