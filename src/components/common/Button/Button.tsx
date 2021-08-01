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
import classnames from "classnames"

import "./button.scss"

type ButtonProps = {
  children: React.ReactNode
  className?: string
  size?: "small" | "normal" | "large"
  outline?: boolean
  aspect?: "primary-light" | "secondary" | "danger" | "warning" | "transparent" | "link" | "link-secondary"
  disabled?: boolean
  rounded?: boolean
  type?: "button" | "submit" | "reset"
  action?: (e: React.SyntheticEvent) => void
}

const Button = ({
  children,
  className,
  size,
  outline,
  aspect,
  action,
  disabled,
  rounded,
  type,
}: ButtonProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target === document.activeElement && e.key === "Enter" && action) {
      action(e)
    }
  }

  return (
    <button
      className={classnames(
        "btn",
        {
          "btn-sm": size === "small",
          "btn-lg": size === "large",
          "btn-outline": outline,
          "btn-rounded": rounded,
          [`btn-${aspect}`]: aspect,
        },
        className
      )}
      type={type}
      onClick={action}
      onKeyDown={handleKeyDown}
      disabled={disabled ? true : false}
    >
      {children}
    </button>
  )
}

export default Button
