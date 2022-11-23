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

import classNames from "@/utils/classnames"

export type ContainerProps = {
  children: React.ReactNode
  as?: React.ElementType
  className?: string
  align?: "start" | "center" | "end" | "stretch" | "baseline"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  flex?: number | string
  row?: boolean
  fluid?: boolean
  noPaddingX?: boolean
  noPaddingY?: boolean
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
  noPaddingX,
  noPaddingY,
}) => {
  return (
    <As
      className={classNames(
        "relative flex flex-grow",
        {
          "max-w-screen-xl": !fluid,
          "flex-row flex-wrap": row,
          "flex-col": !row,
          "px-container": !noPaddingX,
          "py-container": !noPaddingY,
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
