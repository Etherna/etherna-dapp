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

import classNames from "classnames"
import React, { useMemo } from "react"

import classes from "@/styles/components/common/TextField.module.scss"

import Label from "@/components/common/Label"

type TextFieldProps = {
  id?: string
  className?: string
  value: string
  type?: "text" | "password" | "email" | "url" | "date" | "time" | "tel" | "radio"
  autoComplete?: "on" | "off" | "name" | "given-name" | "family-name" |
  "email" | "tel" | "url" | "current-password" | "new-password" | "one-time-code"
  placeholder?: string
  error?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  multiline?: boolean
  autoFocus?: boolean
  small?: boolean
  charactersLimit?: number
  elRef?: React.MutableRefObject<any>
  onChange?(value: string): void
  onKeyDown?(e: React.KeyboardEvent<HTMLInputElement>): void
  onEnter?(): void
  onBlur?(): void
  onFocus?(): void
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  className,
  value,
  checked,
  type = "text",
  autoComplete,
  placeholder,
  error,
  label,
  charactersLimit,
  multiline,
  autoFocus,
  disabled,
  small,
  elRef,
  onChange,
  onKeyDown,
  onEnter,
  onBlur,
  onFocus,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (charactersLimit) {
      value = value.substr(0, charactersLimit)
    }
    onChange?.(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onEnter?.()
    }
    onKeyDown?.(e)
  }

  const Field: React.FC<React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>> = useMemo(
    () => (props: React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) => (
      <>
        {multiline ? (
          <textarea {...props} rows={6} ref={elRef} />
        ) : (
          <input {...props} ref={elRef} />
        )}
      </>
    ) as any,
    [multiline, elRef]
  )

  return (
    <>
      {label && (
        <Label htmlFor={id}>{label}</Label>
      )}
      <div className={classNames(classes.textFieldWrapper, className)}>
        <Field
          id={id}
          className={classNames(classes.textField, {
            [classes.small]: small,
            [classes.charlimit]: !!charactersLimit
          })}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          checked={checked}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
        />
        {charactersLimit && (
          <span className={classNames(classes.textFieldCharCounter, {
            [classes.limitReached]: value.length === charactersLimit
          })}>
            {value.length}/{charactersLimit}
          </span>
        )}
        {error && (
          <small className={classes.textFieldError}>{error}</small>
        )}
      </div>
    </>
  )
}

export default TextField
