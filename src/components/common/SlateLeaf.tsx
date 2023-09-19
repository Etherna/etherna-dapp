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

import useDarkMode from "@/hooks/useDarkMode"

import type { SlateText } from "@/utils/slate"
import type { RenderLeafProps } from "slate-react"

export type SlateLeafProps = RenderLeafProps & {
  leaf?: SlateText
}

const SlateLeaf: React.FC<SlateLeafProps> = ({ children, attributes, leaf }) => {
  const { darkMode } = useDarkMode()

  const style: React.CSSProperties = {
    fontSize: leaf.size ? `${leaf.size}pt` : undefined,
    color: leaf.link ? "#00AABE" : undefined,
    backgroundColor: leaf.code ? (darkMode ? "#374151" : "#E5E7EB") : undefined,
    borderRadius: leaf.code ? "4px" : undefined,
    padding: leaf.code ? "1px 2px" : undefined,
  }

  if (leaf.bold) {
    children = (
      <strong className="font-bold" style={style}>
        {children}
      </strong>
    )
  }
  if (leaf.code) {
    children = <code style={style}>{children}</code>
  }
  if (leaf.italic) {
    children = <em style={style}>{children}</em>
  }
  if (leaf.underline) {
    children = <u style={style}>{children}</u>
  }
  if (leaf.striketrough) {
    children = <s style={style}>{children}</s>
  }
  return (
    <span style={style} {...attributes}>
      {children}
    </span>
  )
}

export default SlateLeaf
