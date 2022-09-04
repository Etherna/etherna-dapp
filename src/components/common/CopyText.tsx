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
import React, { useState } from "react"

import Tippy from "@tippyjs/react"
import classNames from "classnames"

import classes from "@/styles/components/common/CopyText.module.scss"
import { CheckIcon, ClipboardIcon } from "@heroicons/react/solid"

type CopyTextProps = {
  children?: string
  label?: string
  onCopy?(): void
}

const CopyText: React.FC<CopyTextProps> = ({ children, label, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    // Create the text field
    const field = document.createElement("input")
    field.value = children as string

    // Select the text field
    field.select()
    field.setSelectionRange(0, 999999) // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(field.value)

    setCopied(true)
    onCopy?.()

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold">{label}</label>}

      <div className="flex items-start p-2 rounded bg-gray-100 dark:bg-gray-600 font-mono text-gray-800 dark:text-gray-300">
        <span className="flex-1 my-auto break-words break-all leading-tight">{children}</span>

        <Tippy content="Copy" delay={100}>
          <button
            className={classNames(
              "relative inline-flex items-center rounded bg-transparent border-none p-1 ml-3",
              "text-gray-500 dark:text-gray-300 bg-gray-300 dark:bg-gray-500 active:bg-gray-700/40 dark:active:bg-gray-700/20",
              {
                [classes.copied]: copied,
              }
            )}
            onClick={copy}
          >
            <ClipboardIcon className={classNames({ "opacity-0": copied })} width={20} aria-hidden />
            <CheckIcon
              className={classNames("hidden absolute-center text-green-500", { block: copied })}
              width={20}
              aria-hidden
            />
          </button>
        </Tippy>
      </div>
    </div>
  )
}

export default CopyText
