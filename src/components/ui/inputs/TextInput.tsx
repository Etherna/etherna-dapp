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
import React, { useCallback, useMemo } from "react"
import classNames from "classnames"

import { Label } from "@/components/ui/display"

export type TextInputProps = {
  id?: string
  className?: string
  inputClassName?: string
  value: string
  type?: "text" | "password" | "email" | "url" | "date" | "time" | "tel"
  autoComplete?:
    | "on"
    | "off"
    | "name"
    | "given-name"
    | "family-name"
    | "email"
    | "tel"
    | "url"
    | "current-password"
    | "new-password"
    | "one-time-code"
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

export type TextInputCharsLimitProps = {
  className?: string
  textLength: number
  limit: number
}

const TextInputCharsLimit: React.FC<TextInputCharsLimitProps> = ({
  className,
  textLength,
  limit,
}) => {
  return (
    <span
      className={classNames(
        "absolute bottom-2 right-2 text-xs font-medium",
        "text-gray-800/25 dark:text-gray-100/25",
        {
          "text-red-400": textLength === limit,
        },
        className
      )}
    >
      {textLength}/{limit}
    </span>
  )
}

const TextInput: React.FC<TextInputProps> & { CharactersLimit: typeof TextInputCharsLimit } = ({
  id,
  className,
  inputClassName,
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
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value
      if (charactersLimit) {
        value = value.substr(0, charactersLimit)
      }
      onChange?.(value)
    },
    [charactersLimit, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onEnter?.()
      }
      onKeyDown?.(e)
    },
    [onEnter, onKeyDown]
  )

  const Field: React.FC<React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>> = useMemo(
    () => (props: React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) =>
      (
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
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={classNames("relative", className)}>
        <Field
          id={id}
          className={classNames(
            "block w-full appearance-none rounded-md border py-3 px-3 leading-tight",
            "border-gray-200 bg-gray-900/5 placeholder-gray-400",
            "dark:border-gray-800  dark:bg-gray-100/5 dark:placeholder-gray-500",
            "dark:focus:border-green-500 dark:focus:bg-transparent",
            "focus:border-green-500 focus:bg-transparent focus:outline-none focus:ring-0",
            "transition-colors duration-100",
            {
              "text-gray-700 dark:text-gray-200 dark:focus:text-gray-200": !disabled,
              "cursor-not-allowed text-gray-500": disabled,
              "text-base": !small,
              "text-sm": small,
              "pb-8": !!charactersLimit,
            },
            inputClassName
          )}
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
          data-component="text-input"
        />
        {charactersLimit && (
          <TextInputCharsLimit textLength={value.length} limit={charactersLimit} />
        )}
        {error && <small className="mt-1 text-xs font-medium text-red-500">{error}</small>}
      </div>
    </>
  )
}
TextInput.CharactersLimit = TextInputCharsLimit

export default TextInput
