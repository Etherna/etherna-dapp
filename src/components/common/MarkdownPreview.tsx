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
import classNames from "classnames"

import classes from "@styles/components/common/MarkdownPreview.module.scss"

import microdown from "@utils/microdown"

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
  disableHeading
}) => {
  const markdown = useMemo(() => {
    const formattedMarkdown = forceNewLine
      ? value.replace(/\n/g, "<br />")
      : value
    return microdown(formattedMarkdown)
  }, [value, forceNewLine])

  return (
    <As
      className={classNames(classes.markdownPreview, className, {
        [classes.noHeading]: disableHeading
      })}
      style={style}
      role={role}
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  )
}

export default MarkdownPreview
