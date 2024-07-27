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

import React, { useEffect, useState } from "react"

import { ChevronDownIcon } from "@heroicons/react/24/solid"

import MarkdownPreview from "@/components/common/MarkdownPreview"
import { Button } from "@/components/ui/actions"
import { cn } from "@/utils/classnames"

type TextCollapserProps = {
  className?: string
  buttonClassName?: string
  text: string
  previewLines?: number
}

const TextCollapser: React.FC<TextCollapserProps> = ({
  className,
  buttonClassName,
  text,
  previewLines = 5,
}) => {
  const [textElement, setTextElement] = useState<HTMLDivElement>()
  const [shouldCompress, setShouldCompress] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    if (!textElement) return

    function updateShouldCompress() {
      const lineHeight = parseInt(getComputedStyle(textElement!).lineHeight)
      const lines = Math.ceil(textElement!.scrollHeight / lineHeight)

      setShouldCompress(lines > previewLines)
    }

    const resizeObserver = new ResizeObserver(updateShouldCompress)
    resizeObserver.observe(document.documentElement)

    updateShouldCompress()

    return () => {
      resizeObserver.disconnect()
    }
  }, [textElement, previewLines])

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "relative",
          shouldCompress && {
            "after:absolute after:inset-x-0 after:bottom-0 after:block after:h-20": true,
            "after:bg-gradient-to-t after:from-gray-50 after:to-gray-50/0": true,
            "after:dark:from-gray-900 after:dark:to-gray-800/0": true,
            "after:transition-opacity after:duration-200": true,
            "overflow-hidden transition-[max-height] duration-500 ease-out": true,
          },
          {
            "after:pointer-events-none after:opacity-0": showMore,
          }
        )}
        style={{
          maxHeight:
            showMore && shouldCompress
              ? `${textElement!.scrollHeight}px`
              : `${previewLines * 1.5}rem`,
        }}
        ref={el => el && setTextElement(el)}
      >
        <MarkdownPreview value={text} disableHeading={true} forceNewLine />
      </div>

      {shouldCompress && (
        <Button
          className={cn(
            "font-medium text-gray-500 focus:ring-0 focus:ring-offset-0 dark:text-gray-500",
            buttonClassName
          )}
          aspect="text"
          prefix={
            <ChevronDownIcon
              width={20}
              className={cn({
                "rotate-180": showMore,
              })}
              aria-hidden
            />
          }
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  )
}

export default TextCollapser
