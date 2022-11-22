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
import React, { useMemo } from "react"
import { marked } from "marked"
import { filterXSS } from "xss"

import classNames from "@/utils/classnames"

type MarkdownPreviewProps = {
  value: string
  as?: React.ElementType
  role?: string
  forceNewLine?: boolean
  className?: string
  style?: React.CSSProperties
  disableHeading?: boolean
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  value,
  as: As = "div",
  role,
  forceNewLine,
  className,
  style,
  disableHeading,
}) => {
  const markdown = useMemo(() => {
    const formattedMarkdown = forceNewLine ? value.replace(/\n/g, "<br />") : value
    const html = filterXSS(marked(formattedMarkdown))
    const safeLinksHtml = html.replace(
      /<a href="(.*?)">(.*?)<\/a>/g,
      (_, href: string, text: string) => {
        const url = text.startsWith("http") ? text : href
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
      }
    )
    return safeLinksHtml
  }, [value, forceNewLine])

  return (
    <As
      className={classNames(
        "prose max-w-none dark:prose-invert",
        "prose-a:text-primary-500 prose-a:no-underline hover:prose-a:text-primary-400",
        {
          "prose-h1:text-base": disableHeading,
          "prose-h2:text-base": disableHeading,
          "prose-h3:text-base": disableHeading,
          "prose-h4:text-base": disableHeading,
          "prose-h5:text-base": disableHeading,
          "prose-h6:text-base": disableHeading,
        },
        className
      )}
      style={style}
      role={role}
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  )
}

export default MarkdownPreview
