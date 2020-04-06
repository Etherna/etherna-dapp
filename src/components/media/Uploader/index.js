import React, { useState } from "react"
import classnames from "classnames"
import { Redirect } from "react-router-dom"
import { useSelector } from "react-redux"

import "./uploader.scss"
import FileDrag from "./FileDrag"
import SwarmFileUpload from "./SwarmFileUpload"
import Alert from "@common/Alert"
import Button from "@common/Button"
import Avatar from "@components/user/Avatar"
import { showError } from "@state/actions/modals"
import { addVideoToChannel } from "@utils/ethernaResources/channelResources"
import { getVideoDuration } from "@utils/media"
import * as Routes from "@routes"
import PinContentField from "./PinContentField"

const Uploader = () => {
    const { name, avatar, existsOnIndex } = useSelector(state => state.profile)
    const { isSignedIn, address } = useSelector(state => state.user)
    const [videoFile, setVideoFile] = useState(undefined)
    const [videoHash, setVideoHash] = useState(undefined)
    const [duration, setDuration] = useState(undefined)
    const [thumbnailFile, setThumbnailFile] = useState(undefined)
    const [thumbnail, setThumbnail] = useState(undefined)
    const [pinContent, setPinContent] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [videoLink, setVideoLink] = useState(false)

    if (!isSignedIn) {
        return (
            <p className="text-lg text-gray-700 text-center my-16">
                You must sign in first.
            </p>
        )
    }

    if (!existsOnIndex) {
        return <Redirect to={Routes.getChannelLink(address)} />
    }

    const submitVideo = async () => {
        setIsSubmitting(true)
        try {
            await addVideoToChannel(
                address,
                videoHash,
                title,
                description,
                duration,
                thumbnail
            )
            submitCompleted()
        } catch (error) {
            console.error(error)
            showError("Linking error", error.message)
        }
        setIsSubmitting(false)
    }

    const submitCompleted = () => {
        setVideoLink(Routes.getVideoLink(videoHash))
        setVideoFile(undefined)
        setVideoHash(undefined)
        setDuration(undefined)
        setThumbnailFile(undefined)
        setThumbnail(undefined)
        setTitle("")
        setDescription("")
        setHasSubmitted(true)
    }

    const selectVideoFile = async file => {
        try {
            const duration = await getVideoDuration(file)
            setVideoFile(file)
            setDuration(duration)
        } catch (error) {
            console.error(error)
            showError("Metadata error", error.message)
        }
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
                        Your video has been successfully uploaded and linked to
                        your profile. <br />
                        You can watch your video at this link:
                        <a href={videoLink}>
                            <strong>{videoLink}</strong>
                        </a>
                    </Alert>
                )}
            </div>
            <div className="row">
                <div className="col sm:w-1/2">
                    <div className="form-group">
                        <label htmlFor="video">Video</label>
                        {videoFile === undefined && (
                            <FileDrag
                                id="video-input"
                                label="Drag your video here"
                                onSelectFile={selectVideoFile}
                                disabled={isSubmitting}
                            />
                        )}
                        {videoFile !== undefined && (
                            <SwarmFileUpload
                                file={videoFile}
                                onFinishedUploading={hash => setVideoHash(hash)}
                                onRemoveFile={() => {
                                    setVideoFile(undefined)
                                    setVideoHash(undefined)
                                }}
                                disabled={isSubmitting}
                                pinContent={pinContent}
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="thumbnail">Thumbnail</label>
                        {thumbnailFile === undefined && (
                            <FileDrag
                                id="thumb-input"
                                label="Drag your thumbnail here"
                                onSelectFile={file => setThumbnailFile(file)}
                                disabled={isSubmitting}
                            />
                        )}
                        {thumbnailFile !== undefined && (
                            <SwarmFileUpload
                                file={thumbnailFile}
                                showImagePreview={true}
                                onFinishedUploading={hash => setThumbnail(hash)}
                                onRemoveFile={() => {
                                    setThumbnailFile(undefined)
                                    setThumbnail(undefined)
                                }}
                                disabled={isSubmitting}
                                pinContent={pinContent}
                            />
                        )}
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
                <div className="col step-col sm:w-1/2">
                    <ul className="upload-steps mb-4">
                        <li
                            className={classnames("upload-step", {
                                "step-done": videoHash,
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
                                "step-done": thumbnail,
                            })}
                        >
                            Add a thumbnail (optional)
                        </li>
                    </ul>
                    {isSubmitting ? (
                        <img
                            src={require("@svg/animated/spinner.svg")}
                            width={30}
                            alt=""
                        />
                    ) : (
                        <Button
                            action={submitVideo}
                            disabled={videoHash === undefined || title === ""}
                        >
                            Add video
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Uploader
