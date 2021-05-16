import React, { useState } from "react"

import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import thumbPlaceholder from "@svg/backgrounds/thumb-placeholder.svg?url"

import Modal from "@common/Modal"
import Button from "@common/Button"
import SwarmImg from "@common/SwarmImg"
import { showError } from "@state/actions/modals"

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

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteHandler()
    } catch (error) {
      console.error(error)

      onCancel?.()
      showError("Cannot delete video", error.message)
    }

    setIsDeleting(false)
  }

  console.log(imagePreview, thumbPlaceholder);


  return (
    <Modal
      show={show}
      showCancelButton={!isDeleting}
      title="Delete Video"
      footerButtons={
        <>
          {!isDeleting && (
            <>
              <Button aspect="danger" action={handleDelete}>
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
            fallback={thumbPlaceholder}
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
