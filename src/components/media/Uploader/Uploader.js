import React, { useState, useRef } from "react"
import classnames from "classnames"

import "./uploader.scss"

import { UploaderContextWrapper, useUploaderState } from "./UploaderContext"
import VideoSourcesUpload from "./VideoSourcesUpload"
import ThumbnailUpload from "./ThumbnailUpload"
import PinContentField from "./PinContentField"
import Alert from "@common/Alert"
import Button from "@common/Button"
import Avatar from "@components/user/Avatar"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import { updatedVideoMeta } from "@utils/video"
import Routes from "@routes"

const Uploader = () => {
  const videoFlow = useRef()
  const thumbFlow = useRef()

  const { state, actions } = useUploaderState()
  const { manifest, duration, originalQuality, queue } = state
  const { updateManifest } = actions
  const hasQueuedProcesses = queue.filter(q => q.finished === false).length > 0

  const { name, avatar } = useSelector(state => state.profile)
  const { address } = useSelector(state => state.user)
  const { indexClient } = useSelector(state => state.env)

  const [hasVideo, setHasVideo] = useState(false)
  const [hasThumbnail, setHasThumbnail] = useState(false)
  const [pinContent, setPinContent] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [videoLink, setVideoLink] = useState(false)

  const submitVideo = async () => {
    if (!duration || !originalQuality) {
      showError(
        "Metadata error",
        "There was a problem loading the video metadata. Try to re-upload the original video."
      )
      return
    }

    setIsSubmitting(true)
    try {
      const sourcePattern = /^sources\//
      const videoManifest = await updatedVideoMeta(
        manifest, {
          title,
          description,
          originalQuality,
          ownerAddress: address,
          duration,
          sources: queue.filter(q => sourcePattern.test(q.name)).map(q => q.name.replace(sourcePattern, "")),
        },
        pinContent
      )

      updateManifest(videoManifest)

      await indexClient.videos.createVideo(videoManifest)

      submitCompleted(videoManifest)
    } catch (error) {
      console.error(error)
      showError("Linking error", error.message)
    }
    setIsSubmitting(false)
  }

  const submitCompleted = videoManifest => {
    setVideoLink(Routes.getVideoLink(videoManifest))
    setHasVideo(false)
    setHasThumbnail(false)
    setTitle("")
    setDescription("")
    setHasSubmitted(true)
    clearFlows()
  }

  const clearFlows = () => {
    videoFlow.current.clear()
    thumbFlow.current.clear()
  }

  return (
    <div className="uploader">
      <div className="row">
        <h1>Upload a video</h1>
      </div>
      <div className="row mb-6">
        <div className="flex items-center">
          <Avatar image={avatar} address={address} />
          <h3 className="mb-0 ml-1">{name}</h3>
        </div>
      </div>
      <div className="row mb-6">
        {hasSubmitted && (
          <Alert title="" type="success" onClose={() => setHasSubmitted(false)}>
            Your video has been successfully uploaded and linked to your profile. <br />
            You can watch your video at this link:
            <a href={videoLink}>
              <strong>{videoLink}</strong>
            </a>
          </Alert>
        )}
      </div>
      <div className="row">
        <div className="col sm:w-1/2 lg:w-2/3">
          <div className="form-group">
            <VideoSourcesUpload
              ref={videoFlow}
              disabled={isSubmitting}
              onComplete={() => setHasVideo(true)}
            />
          </div>
          <div className="form-group">
            <ThumbnailUpload
              ref={thumbFlow}
              disabled={isSubmitting}
              onCancel={() => setHasThumbnail(false)}
              onComplete={() => setHasThumbnail(true)}
            />
          </div>
          <PinContentField onChange={pin => setPinContent(pin)} />
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              placeholder="Title of the video"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="col step-col sm:w-1/2 lg:w-1/3">
          <ul className="upload-steps mb-4">
            <li
              className={classnames("upload-step", {
                "step-done": hasVideo,
              })}
            >
              Upload a video
            </li>
            <li
              className={classnames("upload-step", {
                "step-done": title !== "",
              })}
            >
              Add a title
            </li>
            <li
              className={classnames("upload-step", {
                "step-done": description !== "",
              })}
            >
              Add a description (optional)
            </li>
            <li
              className={classnames("upload-step", {
                "step-done": hasThumbnail,
              })}
            >
              Add a thumbnail (optional)
            </li>
          </ul>
          {isSubmitting ? (
            <img src={require("@svg/animated/spinner.svg")} width={30} alt="" />
          ) : (
            <Button
              action={submitVideo}
              disabled={manifest == null || title === "" || hasQueuedProcesses || !hasVideo}
            >
              Add video
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const UploaderWithContext = () => (
  <UploaderContextWrapper>
    <Uploader />
  </UploaderContextWrapper>
)

export default UploaderWithContext
