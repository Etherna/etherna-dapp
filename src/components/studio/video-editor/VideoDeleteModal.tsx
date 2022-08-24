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

import classes from "@/styles/components/studio/video-editor/VideoDeleteModal.module.scss"
import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"

import Modal from "@/components/common/Modal"
import Button from "@/components/common/Button"
import Image from "@/components/common/Image"
import { useErrorMessage } from "@/state/hooks/ui"
import { encodedSvg } from "@/utils/svg"
import type { Video } from "@/definitions/swarm-video"
import type { VideosSource } from "@/hooks/useUserVideos"

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
  onCancel
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { showError } = useErrorMessage()

  const title = useMemo(() => {
    return "Remove {0} from {1}?"
      .replace("{0}", videos.length > 1 ? `these ${videos.length} videos` : "this video")
      .replace("{1}", `from ${source.type === "channel" ? `public channel` : `index: "${source.indexUrl}"`}`)
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
        <Button modifier="danger" loading={isDeleting} onClick={handleDelete}>
          Yes, Remove
        </Button>
      }
      onClose={onCancel}
      large
    >
      <div className={classes.videoDeleteContent}>
        <div className={classes.videoDeleteThumbs}>
          {videos.slice(0, 3).map((video, i) => (
            <div className={classes.videoDeleteThumbWrapper} key={i}>
              <div className={classes.videoDeleteThumb} key={i}>
                <Image
                  src={encodedSvg(<ThumbPlaceholder />)}
                  sources={video.thumbnail?.sources}
                  fallbackSrc={encodedSvg(<ThumbPlaceholder />)}
                  placeholder="blur"
                  blurredDataURL={video.thumbnail?.blurredBase64}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={classes.videoDeleteTitleList}>
          {videos.map((video, i) => (
            <h4 className={classes.videoDeleteTitle} key={i}>
              {video.title || "Untitled"}
            </h4>
          ))}
        </div>
      </div>

      <p className={classes.videoDeleteMessage}>
        Do you confirm to remove this {videos.length > 1 ? "videos" : "video"}? <br />
        This operation cannot be undone.
      </p>
    </Modal>
  )
}

export default VideoDeleteModal
