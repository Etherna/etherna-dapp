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
import { Link } from "react-router-dom"

import classNames from "classnames"

import { Spinner } from "../display"

export type ButtonProps = {
  children?: React.ReactNode
  as?: "button" | "a" | "span" | "div"
  className?: string
  style?: React.CSSProperties
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  color?:
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "transparent"
    | "secondary"
    | "muted"
    | "inverted"
  aspect?: "fill" | "outline" | "text"
  type?: "button" | "submit" | "reset"
  to?: string
  rel?: string
  target?: "_blank"
  routeState?: any
  rounded?: boolean
  small?: boolean
  large?: boolean
  lighter?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?(e: React.MouseEvent): void
} & (
  | {
      as?: "button" | "a" | "span" | "div"
    }
  | {
      as: "a"
      href: string
      rel?: string
      target?: "_blank"
      routeState?: any
    }
)

const Button: React.FC<ButtonProps> = ({
  as = "button",
  children,
  className,
  style,
  prefix,
  suffix,
  color = "primary",
  aspect = "fill",
  type,
  to,
  rel,
  target,
  routeState,
  rounded,
  small,
  large,
  lighter,
  loading,
  disabled,
  onClick,
}) => {
  if (as === "a" && !to) {
    throw new Error("Button with 'as' prop set to 'a' must have 'to' prop")
  }

  const As = useMemo(() => {
    if (to && to.startsWith("http")) return "a"
    if (to) return Link

    switch (as) {
      case "a":
        return "a"
      case "span":
        return "span"
      case "div":
        return "div"
      default:
        return "button"
    }
  }, [as, to])

  const linkProps: any = useMemo(() => {
    if (to && to.startsWith("http")) return { href: to, rel, target }
    if (to) return { to, rel, target, state: routeState }
    return {}
  }, [rel, routeState, target, to])

  const isRoundable = aspect === "fill" || aspect === "outline"

  return (
    <As
      className={classNames(
        "inline-flex items-center whitespace-nowrap  font-medium leading-4",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        {
          "text-sm px-3 py-2": !small && !large,
          "py-1 px-3": small,
          "text-base py-3 px-8": large,
          border: aspect === "outline",
        },
        isRoundable && {
          "rounded-md": !rounded && !small && !large,
          rounded: !rounded && small,
          "rounded-lg": !rounded && large,
          "rounded-full": rounded,
        },
        !disabled && {
          "bg-primary-500 text-white active:bg-primary-600":
            color === "primary" && aspect === "fill",
          "border-primary-500 text-primary-500 active:border-primary-600 active:bg-primary-500/10":
            color === "primary" && aspect === "outline",
          "text-primary-500 active:text-primary-600": color === "primary" && aspect === "text",
          "bg-green-500 text-white active:bg-green-600": color === "success" && aspect === "fill",
          "border-green-500 text-green-500 active:border-green-600 active:bg-primary-500/10":
            color === "success" && aspect === "outline",
          "text-green-500 active:text-green-600": color === "success" && aspect === "text",
          "bg-red-500 text-white active:bg-red-600": color === "danger" && aspect === "fill",
          "border-red-500 text-red-500 active:border-red-600 active:bg-primary-500/10":
            color === "danger" && aspect === "outline",
          "text-red-500 active:text-red-600": color === "danger" && aspect === "text",
          "bg-yellow-500 text-white active:bg-yellow-600": color === "warning" && aspect === "fill",
          "border-yellow-500 text-yellow-500 active:border-yellow-600 active:bg-primary-500/10":
            color === "warning" && aspect === "outline",
          "text-yellow-500 active:text-yellow-600": color === "warning" && aspect === "text",
          "bg-sky-500 text-white active:bg-sky-600": color === "info" && aspect === "fill",
          "border-sky-500 text-sky-500 active:border-sky-600 active:bg-primary-500/10":
            color === "info" && aspect === "outline",
          "text-sky-500 active:text-sky-600": color === "info" && aspect === "text",
          "bg-opacity-50 active:bg-opacity-70": lighter,
        },
        disabled && {
          "cursor-not-allowed": true,
          "bg-gray-300/50 text-gray-600/50 dark:bg-gray-700/50 dark:text-gray-300/50":
            aspect === "fill",
          "bg-gray-300/50 text-gray-300/50 dark:bg-gray-700/50 dark:text-gray-700/50":
            aspect === "outline",
          "text-gray-300/50 dark:text-gray-700/50": aspect === "text",
        },
        className
      )}
      {...linkProps}
      type={type}
      disabled={disabled}
      style={style}
      onClick={onClick}
    >
      {loading ? (
        <Spinner className="leading-[1em]" size={large ? 24 : small ? 16 : 20} />
      ) : (
        <>
          {prefix && <span className="mr-2">{prefix}</span>}
          {children}
          {suffix && <span className="ml-2">{suffix}</span>}
        </>
      )}
    </As>
  )
}

export default Button
