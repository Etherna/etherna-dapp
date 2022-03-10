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

import classes from "@styles/components/common/CopyText.module.scss"
import { ReactComponent as ClipboardIcon } from "@assets/icons/clipboard.svg"
import { ReactComponent as CheckIcon } from "@assets/icons/check.svg"

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
      {label && (
        <label className={classes.copyTextLabel}>{label}</label>
      )}

      <div className={classes.copyText}>
        <span className={classes.copyTextContent}>{children}</span>

        <Tippy content="Copy" delay={100}>
          <button
            className={classNames(classes.copyTextBtn, {
              [classes.copied]: copied
            })}
            onClick={copy}
          >
            <ClipboardIcon aria-hidden />
            <CheckIcon className={classes.checkIcon} aria-hidden />
          </button>
        </Tippy>
      </div>
    </div>
  )
}

export default CopyText
