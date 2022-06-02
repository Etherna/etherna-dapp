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

import classes from "@/styles/components/video/VideoDetailsDescription.module.scss"
import { ChevronDownIcon } from "@heroicons/react/solid"

import Button from "@/components/common/Button"
import MarkdownPreview from "@/components/common/MarkdownPreview"

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
    <div className={classNames(classes.videoDescriptionWrapper, {
      [classes.compress]: shouldCompress,
      [classes.showMore]: showMore,
    })}>
      <div
        className={classNames(classes.videoDescription, {
          [classes.compress]: shouldCompress,
          [classes.showMore]: showMore,
        })}
        style={{
          maxHeight: showMore && shouldCompress ? `${descriptionEl!.scrollHeight}px` : ""
        }}
        ref={el => el && setDescriptionEl(el)}
      >
        {description ? (
          <MarkdownPreview value={description} disableHeading={true} />
        ) : (
          <p className={classes.videoDescriptionEmpty}>
            <em>{"This video doesn't have a description"}</em>
          </p>
        )}
      </div>

      {shouldCompress && (
        <Button
          className={classes.videoDescriptionShowMore}
          modifier="transparent"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show less" : "Show more"}
          <ChevronDownIcon aria-hidden />
        </Button>
      )}
    </div>
  )
}

export default VideoDetailsDescription
