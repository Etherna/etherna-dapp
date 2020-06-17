import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link, Redirect } from "react-router-dom"

import "./video-editor.scss"
import Button from "@common/Button"
import FileUploadFlow from "@components/media/Uploader/FileUploadFlow"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import { getResourceUrl, pinResource, unpinResource, isPinned } from "@utils/swarm"
import { getVideo, updateVideo } from "@utils/ethernaResources/videosResources"
import Routes from "@routes"
import Alert from "@components/common/Alert"
import VideoDeleteModal from "./VideoDeleteModal"
import PinContentField from "../Uploader/PinContentField"

const VideoEditor = ({ hash, video }) => {
    const { isSignedIn, address } = useSelector(state => state.user)
    const [isSaving, setIsSaving] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [saved, setSaved] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [pinContent, setPinContent] = useState(undefined)
    const [videoOnIndex, setVideoOnIndex] = useState(true)
    const [videoOwner, setVideoOwner] = useState(video.channelAddress)
    const [title, setTitle] = useState(video.title)
    const [description, setDescription] = useState(video.description)
    const [duration, setDuration] = useState(video.lengthInSeconds)
    const [thumbnail, setThumbnail] = useState(video.thumbnailHash)

    useEffect(() => {
        if (Object.keys(video).length === 0) {
            fetchVideo()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (videoOwner) {
            loadPinning()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoOwner])

    const fetchVideo = async () => {
        try {
            const videoInfo = await getVideo(hash)

            setVideoOwner(videoInfo.channelAddress)
            setTitle(videoInfo.title)
            setDescription(videoInfo.description)
            setDuration(videoInfo.lengthInSeconds)
            setThumbnail(videoInfo.thumbnailHash)
        } catch (error) {
            console.error(error)
            setVideoOnIndex(false)
        }
    }

    const loadPinning = async () => {
        let hashList = [hash]
        thumbnail && hashList.push(thumbnail)

        const pinned = await isPinned(hashList)

        setPinContent(pinned)
    }

    const handleUpdate = async () => {
        setIsSaving(true)

        try {
            await updateVideo(
                hash,
                title,
                description,
                duration,
                thumbnail
            )
            await updatePinning(pinContent)

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

        setDeleted(true)
        setShowDeleteModal(false)
    }

    const updatePinning = async (pin) => {
        if (pin) {
            await Promise.all([
                pinResource(hash, true),
                pinResource(thumbnail, true),
            ])
        } else {
            await Promise.all([
                unpinResource(hash),
                unpinResource(thumbnail),
            ])
        }
    }

    if (videoOwner === undefined || isSignedIn === undefined) {
        return <div />
    }

    if (address !== videoOwner) {
        return <Redirect to={Routes.getHomeLink()} />
    }

    return (
        <div className="video-editor">
            {!videoOnIndex && (
                <div className="table mx-auto mt-32">
                    <img src={require("@svg/backgrounds/404-illustration.svg")} alt="" width={400} />
                    <h2 className="text-center text-gray-800 mt-12">Video not found</h2>
                </div>
            )}
            {videoOnIndex && (
                <>
                    <div className="video-preview">
                        <div className="form-group">
                            {thumbnail && (
                                <>
                                    <img src={getResourceUrl(thumbnail)} alt="" className="thumbnail" />
                                    <Button
                                        aspect="secondary"
                                        size="small"
                                        className="mt-3"
                                        action={() => setThumbnail(null)}
                                    >
                                        Remove
                                    </Button>
                                </>
                            )}
                            {!thumbnail && (
                                <FileUploadFlow
                                    dragLabel={"Drag your thumbnail here"}
                                    acceptTypes={["image"]}
                                    sizeLimit={2}
                                    pinContent={pinContent}
                                    disabled={isSaving}
                                    onHashUpdate={hash => setThumbnail(hash)}
                                />
                            )}
                        </div>
                    </div>
                    {pinContent !== undefined && (
                        <div className="form-group">
                            <PinContentField onChange={pin => setPinContent(pin)} />
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
                                <Alert
                                    type="success"
                                    title="Video Saved!"
                                    onClose={() => setSaved(false)}
                                >
                                    Checkout the video <Link to={Routes.getVideoLink(hash)}>here</Link>
                                </Alert>
                            </div>
                        )}
                        {deleted && (
                            <div className="mb-3">
                                <Alert
                                    type="warning"
                                    title="Video has been deleted"
                                >
                                    To go to your channel, <Link to={Routes.getChannelLink(address)}>click here</Link>
                                </Alert>
                            </div>
                        )}
                        {!deleted && (
                            <>
                                {
                                    !isSaving
                                        ? <Button className="mr-4" action={handleUpdate}>Save</Button>
                                        : <img src={require("@svg/animated/spinner.svg")} alt="" width={26} className="inline-block mr-4" />
                                }
                                <Button aspect="danger" disabled={isSaving} action={() => setShowDeleteModal(true)}>Delete Video</Button>
                            </>
                        )}
                    </div>

                    {showDeleteModal && (
                        <VideoDeleteModal
                            channel={videoOwner}
                            hash={hash}
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

export default VideoEditor
