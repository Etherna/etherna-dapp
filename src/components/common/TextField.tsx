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
import React from "react"

import classes from "@styles/components/common/TextField.module.scss"

import Label from "@common/Label"

type TextFieldProps = {
  id?: string
  value: string
  type?: "text" | "password" | "email" | "url" | "date" | "time" | "tel"
  placeholder?: string
  label?: string
  disabled?: boolean
  small?: boolean
  charactersLimit?: number
  onChange?(value: string): void
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  value,
  type = "text",
  placeholder,
  label,
  charactersLimit,
  disabled,
  small,
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (charactersLimit) {
      value = value.substr(0, charactersLimit)
    }
    onChange?.(value)
  }

  return (
    <>
      {label && (
        <Label htmlFor={id}>{label}</Label>
      )}
      <div className={classes.textFieldWrapper}>
        <input
          id={id}
          className={classNames(classes.textField, {
            [classes.small]: small,
            [classes.charlimit]: !!charactersLimit
          })}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={handleChange}
        />
        {charactersLimit && (
          <span className={classNames(classes.textFieldCharCounter, {
            [classes.limitReached]: value.length === charactersLimit
          })}>
            {value.length}/{charactersLimit}
          </span>
        )}
      </div>
    </>
  )
}

export default TextField
