import React, { useState, useRef } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import { connect } from "react-redux"
import { navigate } from "gatsby"

import "./channel-editor.scss"
import Button from "../../common/Button"
import Modal from "../../common/Modal"
import Image from "../../common/Image"
import {
    isImageObject,
    getResourceUrl,
    uploadResourceToSwarm,
    fileReaderPromise,
} from "../../../utils/swarm"
import * as Routes from "../../../routes"
import actions from "../../../state/actions/channel"

const { updateChannel } = actions

const ChannelEditor = ({ address, name, description, avatar, cover }) => {
    const avatarRef = useRef()
    const coverRef = useRef()
    const [channelName, setChannelName] = useState(name)
    const [channelDescription, setChannelDescription] = useState(description)
    const [channelAvatar, setChannelAvatar] = useState(avatar)
    const [channelCover, setChannelCover] = useState(cover)
    const [isUploadingCover, setUploadingCover] = useState(false)
    const [isUploadingAvatar, setUploadingAvatar] = useState(false)
    const [showUploadErrorModal, setShowUploadErrorModal] = useState(false)
    const [isSavingChannel, setSavingChannel] = useState(false)

    const handleRemoveImage = (e, type = "cover") => {
        e.stopPropagation()

        if (type === "cover") {
            setChannelCover(undefined)
        } else if (type === "avatar") {
            setChannelAvatar(undefined)
        }
    }

    const handleUploadImage = async (e, type = "cover") => {
        const file = e && e.target && e.target.files[0]
        if (!file) return

        type === "avatar" && setUploadingAvatar(true)
        type === "cover" && setUploadingCover(true)

        const imageBuffer = await fileReaderPromise(file)
        const imageData = new Blob([new Uint8Array(imageBuffer)])
        const imgObject = await uploadResourceToSwarm(
            imageData,
            undefined,
            "ipfs"
        )

        type === "avatar" && setUploadingAvatar(false)
        type === "cover" && setUploadingCover(false)

        // reset inputs
        avatarRef.current.value = ""
        coverRef.current.value = ""

        if (imgObject) {
            if (type === "cover") {
                setChannelCover(imgObject)
            } else if (type === "avatar") {
                setChannelAvatar(imgObject)
            }
        } else {
            setShowUploadErrorModal(true)
        }
    }

    const handleSubmit = async () => {
        setSavingChannel(true)
        const saved = await updateChannel(
            channelName,
            channelDescription,
            channelAvatar,
            channelCover
        )
        if (saved) {
            navigate(Routes.getChannelLink(address))
        }
        setSavingChannel(false)
    }

    return (
        <div className="channel channel-editor">
            <div className="cover">
                <label
                    className={classnames("cover-input", {
                        active: isImageObject(channelCover),
                    })}
                    htmlFor="cover-input"
                >
                    {isImageObject(channelCover) && (
                        <img
                            src={getResourceUrl(channelCover)}
                            alt={channelName}
                            className="cover-image"
                        />
                    )}
                    {isUploadingCover && (
                        <div className="absolute inset-x-0 top-0 mt-24 text-center">
                            Uploading...
                        </div>
                    )}
                    <input
                        ref={coverRef}
                        type="file"
                        accept="image/*"
                        name="cover-input"
                        id="cover-input"
                        onChange={e => handleUploadImage(e, "cover")}
                    />
                    <div className="cover-actions">
                        {isImageObject(channelCover) && (
                            <Button
                                className="remove-button"
                                type="button"
                                action={handleRemoveImage}
                            >
                                &#10005;
                            </Button>
                        )}
                        <div className="btn change-button">Change</div>
                    </div>
                </label>
            </div>

            <div className="row items-center px-4">
                <label htmlFor="avatar-input">
                    <div className="channel-avatar" data-label="Change Avatar">
                        {isImageObject(channelAvatar) && (
                            <img
                                src={getResourceUrl(channelAvatar)}
                                alt={channelName}
                            />
                        )}
                        {isUploadingAvatar && (
                            <div className="absolute inset-x-0 top-0 mt-12 text-center">
                                Uploading...
                            </div>
                        )}
                        <input
                            ref={avatarRef}
                            type="file"
                            accept="image/*"
                            name="avatar-input"
                            id="avatar-input"
                            onChange={e => handleUploadImage(e, "avatar")}
                        />
                    </div>
                </label>
                {!isSavingChannel && (
                    <Button
                        className="ml-auto"
                        action={handleSubmit}
                        disabled={channelName === ""}
                    >
                        Save
                    </Button>
                )}
                {isSavingChannel && (
                    <Image
                        filename="spinner.svg"
                        maxWidth="30"
                        className="ml-auto"
                    />
                )}
            </div>

            <div className="row">
                <div className="w-full sm:w-1/2 md:w-1/4 p-4">
                    <input
                        type="text"
                        placeholder="Channel name"
                        value={channelName}
                        onChange={e => setChannelName(e.target.value || "")}
                    />
                    <textarea
                        className="mt-2"
                        placeholder="Channel bio"
                        rows={8}
                        value={channelDescription}
                        onChange={e =>
                            setChannelDescription(e.target.value || "")
                        }
                    />
                </div>
            </div>

            <Modal
                show={showUploadErrorModal}
                setShow={setShowUploadErrorModal}
                showCloseButton={true}
            >
                <div className="flex">
                    <p>
                        There was an error trying to upload the image. Try again
                        later
                    </p>
                </div>
            </Modal>
        </div>
    )
}

const ImageObject = PropTypes.arrayOf(
    PropTypes.shape({
        "@type": PropTypes.string.isRequired,
        contentUrl: PropTypes.shape({
            "/": PropTypes.string.isRequired,
        }).isRequired,
    })
)

ChannelEditor.propTypes = {
    address: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    avatar: ImageObject,
    cover: ImageObject,
}

const mapState = state => {
    return {
        name: state.channel.channelName,
        description: state.channel.channelDescription,
        avatar: state.channel.channelAvatar,
        cover: state.channel.channelCover,
    }
}

export default connect(mapState)(ChannelEditor)
