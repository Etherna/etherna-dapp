import React, { useState } from "react"

import Modal from "@common/Modal"
import Button from "@common/Button"
import SwarmImage from "@components/common/SwarmImage"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { showError } from "@state/actions/modals"
import useSelector from "@state/useSelector"

type VideoDeleteModalProps = {
  hash: string
  title: string
  onCancel?: () => void
  onDelete?: () => void
}

const VideoDeleteModal = ({ hash, title, onCancel, onDelete }: VideoDeleteModalProps) => {
  const { indexClient } = useSelector(state => state.env)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await indexClient.videos.deleteVideo(hash)

      onDelete && onDelete()
    } catch (error) {
      console.error(error)

      onCancel && onCancel()
      showError("Cannot delete video", error.message)
    }
  }

  return (
    <Modal show={true} showCloseButton={false}>
      <div className="modal-header">
        <h4 className="modal-title mx-auto">Delete Video</h4>
      </div>
      <div className="flex my-4">
        <div className="col sm:w-1/4">
          <SwarmImage
            hash={`${hash}/thumbnail`}
            fallback={require("@svg/backgrounds/thumb-placeholder.svg").default}
            className="rounded"
            alt=""
          />
        </div>
        <div className="col sm:w-3/4">
          <h4 className="ml-2 mt-3">{title}</h4>
        </div>
      </div>
      <p className="text-gray-600 my-6">
        Do you confirm to delete this video? <br />
        This operation cannot be undone.
      </p>
      <div className="flex">
        <div className="ml-auto">
          {!isDeleting && (
            <>
              <Button action={onCancel} aspect="secondary" size="small">
                Cancel
              </Button>
              <Button aspect="danger" size="small" className="ml-3" action={handleDelete}>
                Yes, Delete
              </Button>
            </>
          )}
          {isDeleting && (
            <Spinner width="30" />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default VideoDeleteModal
