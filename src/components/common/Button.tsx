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

import React, { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"

import classes from "@styles/components/common/Button.module.scss"
import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"

type ButtonProps = {
  as?: React.ElementType
  href?: string
  rel?: string
  target?: "_blank"
  className?: string
  aspect?: "fill" | "outline" | "link"
  modifier?: "primary" | "transparent" | "secondary" | "inverted" | "warning" | "danger"
  type?: "button" | "submit" | "reset"
  rounded?: boolean
  small?: boolean
  large?: boolean
  lighter?: boolean
  loading?: boolean
  iconOnly?: boolean
  disabled?: boolean
  style?: React.CSSProperties
  onClick?: (e: React.SyntheticEvent) => void
}

const Button: React.FC<ButtonProps> = ({
  children,
  as: As = "button",
  className,
  href,
  rel,
  target,
  small,
  large,
  lighter,
  loading,
  iconOnly,
  aspect = "fill",
  modifier = "primary",
  type,
  disabled,
  rounded,
  onClick,
}) => {
  const [width, setWidth] = useState<number>()
  const [height, setHeight] = useState<number>()
  const [buttonEl, setButtonEl] = useState<HTMLElement>()

  useEffect(() => {
    if (buttonEl && loading) {
      setWidth(buttonEl.clientWidth)
      setHeight(buttonEl.clientHeight)
    }
  }, [buttonEl, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement | HTMLAnchorElement>) => {
    const isActiveElement = e.target === document.activeElement
    const triggers = ["Enter", "Space"]
    if (isActiveElement && triggers.includes(e.key)) {
      onClick?.(e)
    }
  }

  const btnClassName = classNames(
    classes.btn,
    {
      [classes.btnDefault]: aspect !== "link" && !small && !large,
      [classes.btnFill]: aspect === "fill",
      [classes.btnOutline]: aspect === "outline",
      [classes.btnLink]: aspect === "link",
      [classes.btnPrimary]: modifier === "primary",
      [classes.btnSecondary]: modifier === "secondary",
      [classes.btnDanger]: modifier === "danger",
      [classes.btnWarning]: modifier === "warning",
      [classes.btnInverted]: modifier === "inverted",
      [classes.btnTransparent]: modifier === "transparent",
      [classes.btnSmall]: small,
      [classes.btnLarge]: large,
      [classes.btnLight]: lighter,
      [classes.btnRounded]: rounded,
      [classes.btnIcon]: iconOnly,
    },
    className
  )

  return (
    <>
      {As === "a" && href ? (
        <Link
          to={href}
          rel={rel}
          target={target}
          className={btnClassName}
          type={type}
          role="button"
          onClick={onClick}
          onKeyDown={e => handleKeyDown(e as any)}
        >
          {children}
        </Link>
      ) : (
        <As
          className={btnClassName}
          type={type}
          tabIndex={0}
          role="button"
          onClick={onClick}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          style={{
            width: loading && width ? `${width}px` : undefined,
            height: loading && height ? `${height}px` : undefined,
          }}
          ref={(el: HTMLElement) => el && !buttonEl && setButtonEl(el)}
        >
          {loading ? (
            <Spinner className={classes.btnSpinner} />
          ) : (
            <>{children}</>
          )}
        </As>
      )}
    </>
  )
}

export default Button
