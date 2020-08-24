import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link, Redirect } from "react-router-dom"

import "./video-editor.scss"

import VideoDeleteModal from "./VideoDeleteModal"
import VideoSourcesUpload from "../Uploader/VideoSourcesUpload"
import Alert from "@common/Alert"
import Button from "@common/Button"
import PinContentField from "@components/media/Uploader/PinContentField"
import FileUploadFlow from "@components/media/Uploader/FileUploadFlow"
import { UploaderContextWrapper, useUploaderState } from "@components/media/Uploader/UploaderContext"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import { pinResource, unpinResource, isPinned } from "@utils/swarm"
import { fetchFullVideoInfo, updatedVideoMeta } from "@utils/video"
import Routes from "@routes"

/**
 * @param {object} props
 * @param {string} props.hash
 * @param {import("@utils/video").VideoMetadata} props.video
 */
const VideoEditor = ({ hash, video }) => {
  const { state, actions } = useUploaderState()
  const { manifest, duration, originalQuality, queue } = state
  const { updateManifest, loadInitialState } = actions
  const hasQueuedProcesses = queue.filter(q => q.finished === false).length > 0

  const { indexClient } = useSelector(state => state.env)
  const { isSignedIn, address } = useSelector(state => state.user)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pinContent, setPinContent] = useState(undefined)

  const [videoHash, setVideoHash] = useState(hash)
  const [videoMeta, setVideoMeta] = useState(video)
  const [videoOnIndex, setVideoOnIndex] = useState(undefined)
  const [videoOwner, setVideoOwner] = useState(video.ownerAddress)
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description)
  const [thumbnail, setThumbnail] = useState(video.thumbnailHash)

  useEffect(() => {
    Object.keys(video).length === 0 && fetchVideo()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  useEffect(() => {
    Object.keys(videoMeta).length > 0 && loadContext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoMeta])

  useEffect(() => {
    if (videoOwner) {
      loadPinning()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOwner])

  const loadContext = () => {
    loadInitialState(
      videoHash,
      videoMeta.duration,
      videoMeta.originalQuality,
      videoMeta.sources.map(s => s.quality)
    )
  }

  const fetchVideo = async () => {
    try {
      const videoInfo = await fetchFullVideoInfo(videoHash)

      setVideoMeta(videoInfo)
      setVideoOwner(videoInfo.ownerAddress)
      setTitle(videoInfo.title)
      setDescription(videoInfo.description)
      setThumbnail(videoInfo.thumbnailHash)
      setVideoOnIndex(typeof videoInfo.isVideoOnIndex === "boolean" ? videoInfo.isVideoOnIndex : true)
    } catch (error) {
      console.error(error)
      setVideoOnIndex(false)
    }
  }

  const loadPinning = async () => {
    let hashList = [videoHash]
    thumbnail && hashList.push(thumbnail)

    const pinned = await isPinned(hashList)

    setPinContent(pinned)
  }

  const handleUpdateVideo = async () => {
    setIsSaving(true)

    try {
      const videoManifest = await updatedVideoMeta(manifest, {
        title,
        description,
        originalQuality,
        thumbnailHash: thumbnail,
        ownerAddress: address,
        duration,
        sources: queue.map(q => q.quality),
      })

      updateManifest(videoManifest)

      await indexClient.videos.updateVideo(videoHash, videoManifest)

      await updatePinning(pinContent)

      setVideoHash(videoManifest)

      setSaved(true)
    } catch (error) {
      console.error(error)
      showError("Cannot update video", error.message)
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    try {
      await updatePinning(false)
    } catch (error) {
      error(error)
    }

    window.location.reload()
  }

  const updatePinning = async pin => {
    if (pin) {
      await Promise.all([
        pinResource(videoHash, true),
        pinResource(thumbnail, true)
      ])
    } else {
      await Promise.all([
        unpinResource(videoHash),
        unpinResource(thumbnail)
      ])
    }
  }

  if (
    videoOnIndex === undefined ||
    videoMeta === undefined ||
    isSignedIn === undefined
  ) {
    return <div />
  }

  if (videoOnIndex && address !== videoMeta.ownerAddress) {
    return <Redirect to={Routes.getHomeLink()} />
  }

  return (
    <div className="video-editor">
      {!videoOnIndex && (
        <div className="table mx-auto mt-32">
          <img src={require("@svg/backgrounds/404-illustration.svg")} alt="" width={320} />
          <h2 className="text-center text-gray-800 mt-12">Video not found</h2>
        </div>
      )}
      {videoOnIndex && (
        <>
          <div className="video-preview">
            <div className="form-group">
              <VideoSourcesUpload
                hash={videoHash}
                initialSources={videoMeta.sources}
                pinContent={pinContent}
                disabled={isSaving}
              />
            </div>
            <div className="form-group">
              <FileUploadFlow
                hash={thumbnail}
                label={"Thumbnail"}
                dragLabel={"Drag your thumbnail here"}
                acceptTypes={["image"]}
                sizeLimit={2}
                showImagePreview={true}
                pinContent={pinContent}
                disabled={isSaving}
                onHashUpdate={hash => setThumbnail(hash)}
              />
            </div>
          </div>
          {pinContent !== undefined && (
            <div className="form-group">
              <PinContentField pinningEnabled={pinContent} onChange={pin => setPinContent(pin)} />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              placeholder="Title of the video"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Description of the video"
              value={description}
              rows={10}
              onChange={e => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="form-group">
            {saved && (
              <div className="mb-3">
                <Alert type="success" title="Video Saved!" onClose={() => setSaved(false)}>
                  Checkout the video <Link to={Routes.getVideoLink(manifest)}>here</Link>
                </Alert>
              </div>
            )}

            {!isSaving ? (
              <Button
                className="mr-4"
                action={handleUpdateVideo}
                disabled={!title || hasQueuedProcesses}
              >
                Save
              </Button>
            ) : (
              <img
                src={require("@svg/animated/spinner.svg")}
                alt=""
                width={26}
                className="inline-block mr-4"
              />
            )}
            <Button aspect="danger" disabled={isSaving} action={() => setShowDeleteModal(true)}>
              Delete Video
            </Button>
          </div>

          {showDeleteModal && (
            <VideoDeleteModal
              hash={videoHash}
              thumbnail={thumbnail}
              title={title}
              onCancel={() => setShowDeleteModal(false)}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  )
}

VideoEditor.propTypes = {
  hash: PropTypes.string.isRequired,
  video: PropTypes.object,
}

const VideoEditorWithContext = props => (
  <UploaderContextWrapper>
    <VideoEditor {...props} />
  </UploaderContextWrapper>
)

export default VideoEditorWithContext
