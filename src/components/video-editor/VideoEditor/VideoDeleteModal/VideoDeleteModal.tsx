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

import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"
import { ReactComponent as ThumbPlaceholder } from "@assets/backgrounds/thumb-placeholder.svg"

import Modal from "@common/Modal"
import Button from "@common/Button"
import SwarmImg from "@common/SwarmImg"
import { useErrorMessage } from "@state/hooks/ui"
import { encodedSvg } from "@utils/svg"

type VideoDeleteModalProps = {
  show: boolean
  imagePreview?: string
  title: string
  deleteHandler: () => Promise<void>
  onCancel?: () => void
}

const VideoDeleteModal: React.FC<VideoDeleteModalProps> = ({
  show,
  imagePreview,
  title,
  deleteHandler,
  onCancel
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { showError } = useErrorMessage()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteHandler()
    } catch (error: any) {
      console.error(error)

      onCancel?.()
      showError("Cannot delete video", error.message)
    }

    setIsDeleting(false)
  }

  return (
    <Modal
      show={show}
      showCancelButton={!isDeleting}
      title="Delete Video"
      footerButtons={
        <>
          {!isDeleting && (
            <>
              <Button modifier="danger" onClick={handleDelete}>
                Yes, Delete
              </Button>
            </>
          )}
          {isDeleting && (
            <Spinner width="30" />
          )}
        </>
      }
      onClose={onCancel}
    >
      <div className="flex my-4">
        <div className="col sm:w-1/4">
          <SwarmImg
            image={imagePreview}
            fallback={encodedSvg(<ThumbPlaceholder />)}
            className="rounded min-h-16 bg-gray-500"
            alt=""
          />
        </div>
        <div className="col sm:w-3/4">
          <h4 className="ml-2 mt-3">{title}</h4>
        </div>
      </div>
      <p>
        Do you confirm to delete this video? <br />
        This operation cannot be undone.
      </p>
    </Modal>
  )
}

export default VideoDeleteModal