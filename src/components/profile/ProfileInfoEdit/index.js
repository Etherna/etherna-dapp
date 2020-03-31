import React, { useRef, useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import { useSelector } from "react-redux"

import "./profile-info-edit.scss"
import Button from "@common/Button"
import Modal from "@common/Modal"
import {
    isImageObject,
    getResourceUrl,
    uploadResourceToSwarm,
} from "@utils/swarm"
import makeBlockies from "@utils/makeBlockies"

const ProfileInfoEdit = ({
    profileAddress,
    submitLabel,
    isSubmitting,
    onSubmit,
}) => {
    const { name, description, avatar, cover } = useSelector(
        state => state.profile
    )
    const avatarRef = useRef()
    const coverRef = useRef()
    const [profileName, setProfileName] = useState(name)
    const [profileDescription, setProfileDescription] = useState(description)
    const [profileAvatar, setProfileAvatar] = useState(avatar)
    const [profileCover, setProfileCover] = useState(cover)
    const [isUploadingCover, setUploadingCover] = useState(false)
    const [isUploadingAvatar, setUploadingAvatar] = useState(false)
    const [showUploadErrorModal, setShowUploadErrorModal] = useState(false)

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit({
                profileAddress,
                name: profileName,
                description: profileDescription,
                avatar: profileAvatar,
                cover: profileCover,
            })
        }
    }

    const handleRemoveImage = (e, type = "cover") => {
        e.stopPropagation()

        if (type === "cover") {
            setProfileCover(undefined)
        } else if (type === "avatar") {
            setProfileAvatar(undefined)
        }
    }

    const handleUploadImage = async (e, type = "cover") => {
        const file = e && e.target && e.target.files[0]
        if (!file) return

        type === "avatar" && setUploadingAvatar(true)
        type === "cover" && setUploadingCover(true)

        const imgObject = await uploadResourceToSwarm(file)

        type === "avatar" && setUploadingAvatar(false)
        type === "cover" && setUploadingCover(false)

        // reset inputs
        avatarRef.current.value = ""
        coverRef.current.value = ""

        if (imgObject) {
            if (type === "cover") {
                setProfileCover(imgObject)
            } else if (type === "avatar") {
                setProfileAvatar(imgObject)
            }
        } else {
            setShowUploadErrorModal(true)
        }
    }

    return (
        <div className="profile profile-info-edit">
            <div className="cover">
                <label
                    className={classnames("cover-input", {
                        active: isImageObject(profileCover),
                    })}
                    htmlFor="cover-input"
                >
                    {isImageObject(profileCover) && (
                        <img
                            src={getResourceUrl(profileCover)}
                            alt={profileName}
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
                        {isImageObject(profileCover) && (
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
                    <div className="profile-avatar" data-label="Change Avatar">
                        <img
                            src={
                                isImageObject(profileAvatar)
                                    ? getResourceUrl(profileAvatar)
                                    : makeBlockies(profileAddress)
                            }
                            alt={profileName}
                        />
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
                {!isSubmitting && (
                    <Button
                        className="ml-auto"
                        action={handleSubmit}
                        disabled={profileName === ""}
                    >
                        {submitLabel}
                    </Button>
                )}
                {isSubmitting && (
                    <img
                        src={require("@svg/animated/spinner.svg")}
                        className="ml-auto"
                        width="30"
                        alt=""
                    />
                )}
            </div>

            <div className="row">
                <div className="w-full sm:w-1/2 md:w-1/4 p-4">
                    <input
                        type="text"
                        placeholder="Profile name"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value || "")}
                    />
                    <textarea
                        className="mt-2"
                        placeholder="Profile bio"
                        rows={8}
                        value={profileDescription}
                        onChange={e =>
                            setProfileDescription(e.target.value || "")
                        }
                    />
                </div>
                <div className="w-full sm:w-1/2 md:w-3/4 p-4">
                    {/* Nothing right now */}
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

ProfileInfoEdit.propTypes = {
    profileAddress: PropTypes.string.isRequired,
    submitLabel: PropTypes.string,
    isSubmitting: PropTypes.bool,
    onSubmit: PropTypes.func,
}

ProfileInfoEdit.defaultProps = {
    submitLabel: "Save",
    isSubmitting: false,
}

export default ProfileInfoEdit