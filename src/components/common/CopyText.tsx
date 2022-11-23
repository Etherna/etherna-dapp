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
import React, { useCallback, useState } from "react"
import Tippy from "@tippyjs/react"

import { CheckIcon } from "@heroicons/react/24/outline"
import { ClipboardIcon } from "@heroicons/react/24/solid"

import classNames from "@/utils/classnames"

type CopyTextProps = {
  children?: string
  label?: string
  onCopy?(): void
}

const CopyText: React.FC<CopyTextProps> = ({ children, label, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
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
  }, [children, onCopy])

  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold">{label}</label>}

      <div className="flex items-start rounded bg-gray-100 p-2 font-mono text-gray-800 dark:bg-gray-600 dark:text-gray-300">
        <span className="my-auto flex-1 break-words break-all leading-tight">{children}</span>

        <Tippy content="Copy" delay={100}>
          <button
            className={classNames(
              "relative ml-3 inline-flex items-center rounded border-none bg-transparent p-1",
              "bg-gray-300 text-gray-500 active:bg-gray-700/40 dark:bg-gray-500 dark:text-gray-300 dark:active:bg-gray-700/20"
            )}
            onClick={copy}
          >
            <ClipboardIcon className={classNames({ "opacity-0": copied })} width={20} aria-hidden />
            <CheckIcon
              className={classNames("text-green-500 absolute-center", {
                hidden: !copied,
                block: copied,
              })}
              strokeWidth={4}
              width={16}
              aria-hidden
            />
          </button>
        </Tippy>
      </div>
    </div>
  )
}

export default CopyText
