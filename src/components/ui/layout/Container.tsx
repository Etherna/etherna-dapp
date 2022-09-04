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

export type ContainerProps = {
  children: React.ReactNode
  as?: React.ElementType
  className?: string
  align?: "start" | "center" | "end" | "stretch" | "baseline"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  flex?: number | string
  row?: boolean
  fluid?: boolean
  paddingX?: boolean
  paddingY?: boolean
}

const Container: React.FC<ContainerProps> = ({
  children,
  as: As = "div",
  className,
  align,
  justify,
  flex,
  row,
  fluid,
  paddingX,
  paddingY,
}) => {
  return (
    <As
      className={classNames(
        "w-full",
        "relative flex flex-col w-full",
        {
          "max-w-screen-xl": !fluid,
          "flex-row": row,
          "px-container": paddingX,
          "py-container": paddingY,
          "items-start": align === "start",
          "items-center": align === "center",
          "items-end": align === "end",
          "items-baseline": align === "baseline",
          "items-stretch": align === "stretch",
          "justify-start": justify === "start",
          "justify-center": justify === "center",
          "justify-end": justify === "end",
          "justify-between": justify === "between",
          "justify-around": justify === "around",
          "justify-evenly": justify === "evenly",
        },
        className
      )}
      style={{ flex }}
      data-container
    >
      {children}
    </As>
  )
}

export default Container
