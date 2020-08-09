import React, { useState } from "react"
import PropTypes from "prop-types"

import Modal from "@common/Modal"
import Button from "@common/Button"
import { showError } from "@state/actions/modals"
import { getResourceUrl } from "@utils/swarm"
import { deleteVideo } from "@utils/ethernaResources/videosResources"

/**
 * @param {object} props
 * @param {string} props.channel
 * @param {string} props.hash
 * @param {string} props.thumbnail
 * @param {string} props.title
 * @param {Function} props.onCancel
 * @param {Function} props.onDelete
 */
const VideoDeleteModal = ({ hash, thumbnail, title, onCancel, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteVideo(hash)

      onDelete()
    } catch (error) {
      console.error(error)

      onCancel()
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
          <img
            src={
              thumbnail
                ? getResourceUrl(thumbnail)
                : require("@svg/backgrounds/thumb-placeholder.svg")
            }
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
            <img src={require("@svg/animated/spinner.svg")} width="30" alt="" />
          )}
        </div>
      </div>
    </Modal>
  )
}

VideoDeleteModal.propTypes = {
  hash: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  title: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default VideoDeleteModal
