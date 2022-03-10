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
