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

import type { SlateElement } from "@/utils/slate"
import type { RenderElementProps } from "slate-react"

export type SlateBlockProps = RenderElementProps & {
  element?: SlateElement
}

const SlateBlock: React.FC<SlateBlockProps> = ({ attributes, children, element }) => {
  const { darkMode } = useDarkMode()

  const isList = ["ol", "ul"].includes(element.type)
  const style: React.CSSProperties = {
    textAlign: element.align,
    listStyle: isList ? (element.type === "ol" ? "decimal" : "disc") : undefined,
    paddingLeft: isList ? "1.5rem" : undefined,
    padding: element.type === "code" ? "4px" : undefined,
    backgroundColor: element.type === "code" ? (darkMode ? "#374151" : "#E5E7EB") : undefined,
    borderRadius: element.type === "code" ? "4px" : undefined,
    color: element.type === "a" ? "#00AABE" : undefined,
  }
  switch (element.type) {
    case "blockquote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case "h1":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case "h2":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case "h3":
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      )
    case "h4":
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      )
    case "h5":
      return (
        <h5 style={style} {...attributes}>
          {children}
        </h5>
      )
    case "h6":
      return (
        <h6 style={style} {...attributes}>
          {children}
        </h6>
      )
    case "ol":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    case "ul":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case "li":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case "code":
      return (
        <pre style={style} {...attributes}>
          <code>{children}</code>
        </pre>
      )
    case "a":
      return (
        <a style={style} {...attributes} href={element.url} target="_blank" rel="noreferrer">
          {children}
        </a>
      )
    case "p":
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
    default:
      return (
        <div style={style} {...attributes}>
          {children}
        </div>
      )
  }
}

export default SlateBlock
