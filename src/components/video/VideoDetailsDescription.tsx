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
import classNames from "classnames"

import { ChevronDownIcon } from "@heroicons/react/solid"

import MarkdownPreview from "@/components/common/MarkdownPreview"
import { Button } from "@/components/ui/actions"

type VideoDetailsDescriptionProps = {
  description?: string | null
}

const VideoDetailsDescription: React.FC<VideoDetailsDescriptionProps> = ({ description }) => {
  const [descriptionEl, setDescriptionEl] = useState<HTMLDivElement>()
  const [shouldCompress, setShouldCompress] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    if (!descriptionEl) return

    function updateShouldCompress() {
      const lineHeight = parseInt(getComputedStyle(descriptionEl!).lineHeight)
      const lines = Math.ceil(descriptionEl!.scrollHeight / lineHeight)

      setShouldCompress(lines > 5)
    }

    const resizeObserver = new ResizeObserver(updateShouldCompress)
    resizeObserver.observe(document.documentElement)

    updateShouldCompress()

    return () => {
      resizeObserver.disconnect()
    }
  }, [descriptionEl])

  return (
    <div className={classNames("flex flex-col")}>
      <div
        className={classNames(
          "relative mt-4 text-gray-800 dark:text-gray-200",
          "after:block after:absolute after:bottom-0 after:h-20 after:inset-x-0",
          "after:bg-gradient-to-t after:from-gray-50 after:to-gray-50/0",
          "after:dark:from-gray-900 after:dark:to-gray-800/0",
          "after:transition-opacity after:duration-200",
          {
            "max-h-[7.5rem] overflow-hidden transition-[max-height] duration-500 ease-out":
              shouldCompress,
            "after:opacity-0 after:pointer-events-none": showMore,
          }
        )}
        style={{
          maxHeight: showMore && shouldCompress ? `${descriptionEl!.scrollHeight}px` : "",
        }}
        ref={el => el && setDescriptionEl(el)}
      >
        {description ? (
          <MarkdownPreview value={description} disableHeading={true} />
        ) : (
          <p className="text-sm text-gray-500">
            <em>{"This video doesn't have a description"}</em>
          </p>
        )}
      </div>

      {shouldCompress && (
        <Button color="transparent" onClick={() => setShowMore(!showMore)}>
          {showMore ? "Show less" : "Show more"}
          <ChevronDownIcon
            className={classNames({
              "rotate-180": showMore,
            })}
            aria-hidden
          />
        </Button>
      )}
    </div>
  )
}

export default VideoDetailsDescription
