import React, { useState, useEffect } from "react"
import { Link, Redirect } from "react-router-dom"

import "./video-editor.scss"

import VideoDeleteModal from "./VideoDeleteModal"
import VideoSourcesUpload from "../Uploader/VideoSourcesUpload"
import ThumbnailUpload from "../Uploader/ThumbnailUpload"
import Alert from "@common/Alert"
import Button from "@common/Button"
import PinContentField from "@components/media/Uploader/PinContentField"
import { UploaderContextWrapper, useUploaderState } from "@components/media/Uploader/UploaderContext"
import MarkdownEditor from "@components/common/MarkdownEditor"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { ReactComponent as NotFoundImage } from "@svg/backgrounds/404-illustration.svg"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import { pinResource, unpinResource, isPinned } from "@utils/swarm"
import { fetchFullVideoInfo, updatedVideoMeta, VideoMetadata } from "@utils/video"
import Routes from "@routes"

type VideoEditorProps = {
  hash: string
  video: VideoMetadata | undefined
}

const VideoEditor = ({ hash, video }: VideoEditorProps) => {
  const { state, actions } = useUploaderState()
  const { manifest, duration, originalQuality, queue } = state
  const { updateManifest, loadInitialState } = actions
  const hasQueuedProcesses = queue.filter(q => q.finished === false).length > 0
  const hasOriginalVideo = queue.findIndex(q => q.name === `sources/${originalQuality}` && q.finished) >= 0

  const { indexClient } = useSelector(state => state.env)
  const { isSignedIn, address } = useSelector(state => state.user)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pinContent, setPinContent] = useState<boolean>()

  const [videoHash, setVideoHash] = useState(hash)
  const [videoMeta, setVideoMeta] = useState(video)
  const [thumbnailHash, setThumbnailHash] = useState(video?.thumbnailHash ? hash : undefined)
  const [videoOnIndex, setVideoOnIndex] = useState<boolean>()
  const [videoOwner, setVideoOwner] = useState(video?.ownerAddress)
  const [title, setTitle] = useState(video?.title || "")
  const [description, setDescription] = useState(video?.description || "")
  const [isDeleted, setIsDeleted] = useState(false)

  useEffect(() => {
    Object.keys(video || {}).length === 0 && fetchVideo()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  useEffect(() => {
    Object.keys(videoMeta || {}).length > 0 && loadContext()
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
      videoMeta!.duration,
      videoMeta!.originalQuality,
      videoMeta!.sources.map(s => s.quality!)
    )

    if (!videoMeta!.duration || !videoMeta!.originalQuality) {
      showError(
        "Metadata error",
        "There was a problem loading the video metadata. Try to refresh the page."
      )
    }
  }

  const fetchVideo = async () => {
    try {
      const videoInfo = await fetchFullVideoInfo(videoHash)

      setVideoMeta(videoInfo)
      setVideoOwner(videoInfo.ownerAddress)
      setTitle(videoInfo.title || "")
      setDescription(videoInfo.description || "")
      setVideoOnIndex(typeof videoInfo.isVideoOnIndex === "boolean" ? videoInfo.isVideoOnIndex : true)
      setThumbnailHash(videoInfo?.thumbnailHash ? hash : undefined)
    } catch (error) {
      console.error(error)
      setVideoOnIndex(false)
    }
  }

  const loadPinning = async () => {
    const pinned = await isPinned(videoHash)
    setPinContent(pinned)
  }

  const handleUpdateVideo = async () => {
    setIsSaving(true)

    try {
      const sourcePattern = /^sources\//
      const videoManifest = await updatedVideoMeta(
        manifest!, {
          title,
          description,
          originalQuality: originalQuality!,
          ownerAddress: address!,
          duration: duration!,
          sources: queue.filter(q => sourcePattern.test(q.name)).map(q => q.name.replace(sourcePattern, ""))
        },
        pinContent
      )

      updateManifest(videoManifest)

      await indexClient.videos.updateVideo(videoHash, videoManifest)

      await updatePinning(false, hash)

      setVideoHash(videoManifest)
      thumbnailHash && setThumbnailHash(videoManifest)

      setSaved(true)
    } catch (error) {
      console.error(error)
      showError("Cannot update video", error.message)
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    try {
      await updatePinning(false, hash)

      setIsDeleted(true)
    } catch (error) {
      error(error)
    }
  }

  const updatePinning = async (pin: boolean, videoManifest: string) => {
    if (pin) {
      await pinResource(videoManifest)
    } else {
      await unpinResource(videoManifest)
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

  if (isDeleted) {
    return <Redirect to={Routes.getProfileLink(videoMeta.ownerAddress || "")} />
  }

  return (
    <div className="video-editor">
      {!videoOnIndex && (
        <div className="table mx-auto mt-32">
          <NotFoundImage width={320} />
          <h2 className="text-center text-gray-800 mt-12">Video not found</h2>
        </div>
      )}
      {videoOnIndex && (
        <>
          <div className="video-preview">
            <div className="form-group">
              <VideoSourcesUpload
                initialSources={videoMeta.sources}
                pinContent={pinContent}
                disabled={isSaving}
              />
            </div>
            <div className="form-group">
              <ThumbnailUpload
                hash={thumbnailHash}
                pinContent={pinContent}
                onCancel={() => setThumbnailHash(undefined)}
                disabled={isSaving}
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
            <MarkdownEditor
              placeholder="Description of the video"
              value={description}
              onChange={value => setDescription(value)}
              disabled={isSaving}
            />
          </div>
          <div className="form-group">
            {saved && (
              <div className="mb-3">
                <Alert type="success" title="Video Saved!" onClose={() => setSaved(false)}>
                  Checkout the video <Link to={Routes.getVideoLink(manifest!)}>here</Link>
                </Alert>
              </div>
            )}

            {!isSaving ? (
              <Button
                className="mr-4"
                action={handleUpdateVideo}
                disabled={!title || hasQueuedProcesses || !hasOriginalVideo}
              >
                Save
              </Button>
            ) : (
              <Spinner width={26} className="inline-block mr-4" />
            )}
            <Button aspect="danger" disabled={isSaving} action={() => setShowDeleteModal(true)}>
              Delete Video
            </Button>
          </div>

          {showDeleteModal && (
            <VideoDeleteModal
              hash={videoHash}
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

const VideoEditorWithContext = (props: VideoEditorProps) => (
  <UploaderContextWrapper>
    <VideoEditor {...props} />
  </UploaderContextWrapper>
)

export default VideoEditorWithContext
