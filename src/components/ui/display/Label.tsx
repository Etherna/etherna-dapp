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

import { cn } from "@/utils/classnames"

type LabelProps = {
  children?: React.ReactNode
  className?: string
  htmlFor?: string
  title?: string
}

const Label: React.FC<LabelProps> = ({ children, className, htmlFor, title }) => {
  return (
    <label
      className={cn(
        "mb-2 block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-400",
        className
      )}
      htmlFor={htmlFor}
      title={title}
    >
      {children}
    </label>
  )
}

export default Label
