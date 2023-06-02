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

import classNames from "@/utils/classnames"

export type TextSize =
  | "xs"
  | "sm"
  | "base"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl"

export type TextHeadings = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

export type TextWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type TextProps = {
  children?: React.ReactNode
  as?: "div" | TextHeadings | "label" | "legend" | "p" | "small" | "span" | "strong"
  h1?: boolean
  h2?: boolean
  h3?: boolean
  h4?: boolean
  h5?: boolean
  h6?: boolean
  center?: boolean
  displayAs?: TextHeadings
  className?: string
  size?: TextSize
  sizeMd?: TextSize
  sizeLg?: TextSize
  weight?: TextWeight
  align?: "left" | "center" | "right"
  mono?: boolean
  noMargin?: boolean
  truncate?: boolean | 1 | 2 | 3 | 4 | 5 | 6
}

const defaultConfig: Record<
  string,
  {
    size: TextSize
    sizeMd?: TextSize
    sizeLg?: TextSize
    weight: TextWeight
  }
> = {
  h1: {
    size: "xl",
    sizeMd: "3xl",
    weight: 700,
  },
  h2: {
    size: "xl",
    sizeMd: "2xl",
    weight: 700,
  },
  h3: {
    size: "lg",
    sizeMd: "xl",
    weight: 700,
  },
  h4: {
    size: "base",
    sizeMd: "lg",
    weight: 500,
  },
  h5: {
    size: "base",
    sizeMd: "md",
    weight: 500,
  },
  h6: {
    size: "sm",
    sizeMd: "base",
    weight: 500,
  },
}

const Text: React.FC<TextProps> = ({
  children,
  as: As = "p",
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  center,
  displayAs,
  className,
  size,
  sizeMd,
  sizeLg,
  weight,
  align,
  mono,
  truncate,
  noMargin,
}) => {
  const config = useMemo(() => {
    const asHeading = h1 ? "h1" : h2 ? "h2" : h3 ? "h3" : h4 ? "h4" : h5 ? "h5" : h6 ? "h6" : null
    const config = defaultConfig[asHeading ?? displayAs ?? As]
    const configSize = size ?? config?.size
    const configSizeMd = sizeMd ?? config?.sizeMd
    const configSizeLg = sizeLg ?? config?.sizeLg
    const configWeight = weight ?? config?.weight ?? 400
    return {
      size: configSize,
      sizeMd: configSizeMd,
      sizeLg: configSizeLg,
      weight: configWeight,
    }
  }, [As, displayAs, h1, h2, h3, h4, h5, h6, size, sizeLg, sizeMd, weight])

  return (
    <As
      className={classNames(className, {
        "text-xs": config.size === "xs",
        "md:text-xs": config.sizeMd === "xs",
        "lg:text-xs": config.sizeLg === "xs",
        "text-sm": config.size === "sm",
        "md:text-sm": config.sizeMd === "sm",
        "lg:text-sm": config.sizeLg === "sm",
        "text-base": config.size === "base",
        "md:text-base": config.sizeMd === "base",
        "lg:text-base": config.sizeLg === "base",
        "text-lg": config.size === "lg",
        "md:text-lg": config.sizeMd === "lg",
        "lg:text-lg": config.sizeLg === "lg",
        "text-xl": config.size === "xl",
        "md:text-xl": config.sizeMd === "xl",
        "lg:text-xl": config.sizeLg === "xl",
        "text-2xl": config.size === "2xl",
        "md:text-2xl": config.sizeMd === "2xl",
        "lg:text-2xl": config.sizeLg === "2xl",
        "text-3xl": config.size === "3xl",
        "md:text-3xl": config.sizeMd === "3xl",
        "lg:text-3xl": config.sizeLg === "3xl",
        "text-4xl": config.size === "4xl",
        "md:text-4xl": config.sizeMd === "4xl",
        "lg:text-4xl": config.sizeLg === "4xl",
        "text-5xl": config.size === "5xl",
        "md:text-5xl": config.sizeMd === "5xl",
        "lg:text-5xl": config.sizeLg === "5xl",
        "text-6xl": config.size === "6xl",
        "md:text-6xl": config.sizeMd === "6xl",
        "lg:text-6xl": config.sizeLg === "6xl",
        "text-7xl": config.size === "7xl",
        "md:text-7xl": config.sizeMd === "7xl",
        "lg:text-7xl": config.sizeLg === "7xl",
        "text-8xl": config.size === "8xl",
        "md:text-8xl": config.sizeMd === "8xl",
        "lg:text-8xl": config.sizeLg === "8xl",
        "text-9xl": config.size === "9xl",
        "md:text-9xl": config.sizeMd === "9xl",
        "lg:text-9xl": config.sizeLg === "9xl",
        "font-thin": config.weight === 100,
        "font-extralight": config.weight === 200,
        "font-light": config.weight === 300,
        "font-normal": config.weight === 400,
        "font-medium": config.weight === 500,
        "font-semibold": config.weight === 600,
        "font-bold": config.weight === 700,
        "font-extrabold": config.weight === 800,
        "font-black": config.weight === 900,
        "font-mono": mono,
        "text-left": align === "left",
        "text-center": align === "center" || center,
        "text-right": align === "right",
        truncate: truncate === true,
        "line-clamp-1": truncate === 1,
        "line-clamp-2": truncate === 2,
        "line-clamp-3": truncate === 3,
        "line-clamp-4": truncate === 4,
        "line-clamp-5": truncate === 5,
        "line-clamp-6": truncate === 6,
        "mb-[1em]": As.startsWith("h") && !noMargin,
      })}
    >
      {children}
    </As>
  )
}

export default Text
