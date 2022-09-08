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

export type BadgeProps = {
  children: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  className?: string
  color?: "primary" | "success" | "warning" | "error" | "info" | "indigo" | "muted"
  variant?: "fill" | "outline"
  small?: boolean
  rounded?: boolean
  title?: string
  onClick?(): void
}

const Badge: React.FC<BadgeProps> = ({
  children,
  prefix,
  suffix,
  className,
  color = "primary",
  variant = "fill",
  small,
  rounded,
  title,
  onClick,
}) => {
  const As = onClick ? "button" : "span"
  return (
    <As
      className={classNames(
        "inline-flex items-center",
        "whitespace-nowrap font-semibold",
        {
          "rounded-md px-1.5 py-1 text-xs md:text-sm": !small,
          "rounded px-1 py-0.5 text-2xs md:text-xs": small,
          "bg-primary-500 text-white": color === "primary" && variant === "fill",
          "bg-green-500 text-white": color === "success" && variant === "fill",
          "bg-yellow-500 text-white": color === "warning" && variant === "fill",
          "bg-red-500 text-white": color === "error" && variant === "fill",
          "bg-sky-500 text-white": color === "info" && variant === "fill",
          "bg-indigo-500 text-white": color === "indigo" && variant === "fill",
          "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300":
            color === "muted" && variant === "fill",
          border: variant === "outline",
          "border-primary-500 text-primary-500": color === "primary" && variant === "outline",
          "border-green-500 text-green-500": color === "success" && variant === "outline",
          "border-yellow-500 text-yellow-500": color === "warning" && variant === "outline",
          "border-red-500 text-red-500": color === "error" && variant === "outline",
          "border-sky-500 text-sky-500": color === "info" && variant === "outline",
          "border-indigo-500 text-indigo-500": color === "indigo" && variant === "outline",
          "border-gray-600 text-gray-300 dark:border-gray-300 dark:text-gray-700":
            color === "muted" && variant === "outline",
          "rounded-full": rounded,
        },
        className
      )}
      onClick={onClick}
      title={title}
      data-component="badge"
    >
      {prefix && <span className="mr-1">{prefix}</span>}
      <span>{children}</span>
      {suffix && <span className="ml-1">{suffix}</span>}
    </As>
  )
}

export default Badge
