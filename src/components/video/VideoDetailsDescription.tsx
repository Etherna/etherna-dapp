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

import TextCollapser from "@/components/common/TextCollapser"

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
    <div className="mt-4 text-gray-800 dark:text-gray-200">
      {description ? (
        <TextCollapser text={description} previewLines={5} />
      ) : (
        <p className="text-sm text-gray-500">
          <em>{"This video doesn't have a description"}</em>
        </p>
      )}
    </div>
  )
}

export default VideoDetailsDescription
