import React, { useState, useRef } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import { useSelector } from "react-redux"
import { navigate } from "gatsby"

import "./profile-editor.scss"
import Button from "@common/Button"
import Modal from "@common/Modal"
import Image from "@common/Image"
import {
    isImageObject,
    getResourceUrl,
    uploadResourceToSwarm,
    fileReaderPromise,
} from "@utils/swarm"
import { updateProfile } from "@utils/3box"
import * as Routes from "@routes"

const ProfileEditor = ({ address }) => {
    const {
        name,
        description,
        avatar,
        cover
    } = useSelector(state => state.profile)
    const { box } = useSelector(state => state.user)

    const avatarRef = useRef()
    const coverRef = useRef()
    const [profileName, setProfileName] = useState(name)
    const [profileDescription, setProfileDescription] = useState(description)
    const [profileAvatar, setProfileAvatar] = useState(avatar)
    const [profileCover, setProfileCover] = useState(cover)
    const [isUploadingCover, setUploadingCover] = useState(false)
    const [isUploadingAvatar, setUploadingAvatar] = useState(false)
    const [showUploadErrorModal, setShowUploadErrorModal] = useState(false)
    const [isSavingProfile, setSavingProfile] = useState(false)

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

        const imgObject = await uploadResourceToSwarm(
            file,
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
                setProfileCover(imgObject)
            } else if (type === "avatar") {
                setProfileAvatar(imgObject)
            }
        } else {
            setShowUploadErrorModal(true)
        }
    }

    const handleSubmit = async () => {
        setSavingProfile(true)

        const saved = await updateProfile(box, {
            name: profileName,
            description: profileDescription,
            image: profileAvatar,
            coverPhoto: profileCover
        })
        if (saved) {
            navigate(Routes.getProfileLink(address))
        }
        setSavingProfile(false)
    }

    return (
        <div className="profile profile-editor">
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
                        {isImageObject(profileAvatar) && (
                            <img
                                src={getResourceUrl(profileAvatar)}
                                alt={profileName}
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
                {!isSavingProfile && (
                    <Button
                        className="ml-auto"
                        action={handleSubmit}
                        disabled={profileName === ""}
                    >
                        Save
                    </Button>
                )}
                {isSavingProfile && (
                    <Image
                        filename="spinner.svg"
                        width="30"
                        className="ml-auto"
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

ProfileEditor.propTypes = {
    address: PropTypes.string.isRequired,
}

export default ProfileEditor
