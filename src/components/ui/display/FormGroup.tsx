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

export type FormGroupProps = {
  children?: React.ReactNode
  className?: string
  label?: string
  labelFor?: string
  error?: string
}

const FormGroup: React.FC<FormGroupProps> = ({ children, className, label, labelFor, error }) => {
  return (
    <div
      className={classNames("mb-6 flex flex-col last-of-type:mb-0", className)}
      data-component="form-group"
    >
      {label && (
        <label
          className="mb-1.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-400"
          htmlFor={labelFor}
        >
          {label}
        </label>
      )}
      {children}
      {error && <small className="mt-1 text-xs font-medium text-red-500">{error}</small>}
    </div>
  )
}

export default FormGroup
