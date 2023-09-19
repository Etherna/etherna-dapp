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

import React, { useCallback, useMemo, useState } from "react"

import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"

import Image from "@/components/common/Image"
import { Button, Modal } from "@/components/ui/actions"
import useErrorMessage from "@/hooks/useErrorMessage"
import { cn } from "@/utils/classnames"
import { encodedSvg } from "@/utils/svg"

import type { VideosSource } from "@/hooks/useUserVideos"
import type { Video } from "@etherna/sdk-js"

type VideoDeleteModalProps = {
  source: VideosSource
  show: boolean
  videos: Video[]
  deleteHandler: () => Promise<void>
  onCancel?: () => void
}

const VideoDeleteModal: React.FC<VideoDeleteModalProps> = ({
  source,
  show,
  videos,
  deleteHandler,
  onCancel,
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { showError } = useErrorMessage()

  const title = useMemo(() => {
    return "Remove {0} from {1}?"
      .replace("{0}", videos.length > 1 ? `these ${videos.length} videos` : "this video")
      .replace(
        "{1}",
        `from ${source.type === "channel" ? `public channel` : `index: "${source.indexUrl}"`}`
      )
  }, [source, videos.length])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)

    try {
      await deleteHandler()
    } catch (error: any) {
      console.error(error)

      onCancel?.()
      showError("Cannot delete video", error.message)
    }

    setIsDeleting(false)
  }, [deleteHandler, onCancel, showError])

  return (
    <Modal
      show={show}
      showCancelButton={!isDeleting}
      title={title}
      footerButtons={
        <Button color="error" loading={isDeleting} onClick={handleDelete}>
          Yes, Remove
        </Button>
      }
      onClose={onCancel}
      large
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:min-h-24 sm:w-1/3">
          {videos.slice(0, 3).map((video, i) => (
            <div
              className={cn("absolute left-0 top-0 z-[2] h-[80%] w-[91%]", {
                "z-[1] ml-[3%] mt-[3%]": i === 1,
                "z-[0] ml-[6%] mt-[6%]": i === 2,
              })}
              key={i}
            >
              <div className="relative h-full w-full bg-gray-300 dark:bg-gray-600" key={i}>
                <Image
                  src={encodedSvg(<ThumbPlaceholder />)}
                  sources={video.preview.thumbnail?.sources}
                  fallbackSrc={encodedSvg(<ThumbPlaceholder />)}
                  placeholder="blur"
                  blurredDataURL={video.preview.thumbnail?.blurredBase64}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="max-h-40 flex-grow overflow-y-auto sm:pl-4">
          {videos.map((video, i) => (
            <h4 className="text-base font-semibold" key={i}>
              {video.preview.title || "Untitled"}
            </h4>
          ))}
        </div>
      </div>

      <p className="mt-2 block leading-tight">
        Do you confirm to remove this {videos.length > 1 ? "videos" : "video"}? <br />
        This operation cannot be undone.
      </p>
    </Modal>
  )
}

export default VideoDeleteModal
