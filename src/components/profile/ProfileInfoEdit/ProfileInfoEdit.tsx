/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useRef, useState } from "react"
import classnames from "classnames"

import "./profile-info-edit.scss"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"

import Button from "@common/Button"
import Modal from "@common/Modal"
import MarkdownEditor from "@common/MarkdownEditor"
import { Profile } from "@classes/SwarmProfile/types"
import SwarmImage from "@classes/SwarmImage"
import SwarmProfile from "@classes/SwarmProfile"
import useSelector from "@state/useSelector"
import { useImageCrop } from "@state/hooks/ui"
import makeBlockies from "@utils/makeBlockies"

type ImageType = "avatar" | "cover"

type ProfileInfoEditProps = {
  profileAddress: string
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit?: (profile: Profile) => void
}

type ImagesUtils = {
  [key in ImageType]: {
    setLoading: (loading: boolean) => void,
    updateImage: (image: SwarmImage | undefined) => void,
    responsiveSizes: number[]
  }
}

const ProfileInfoEdit: React.FC<ProfileInfoEditProps> = ({
  profileAddress,
  submitLabel = "Save",
  isSubmitting,
  onSubmit
}) => {
  const { beeClient } = useSelector(state => state.env)
  const { name, description, avatar, cover } = useSelector(state => state.profile)
  const { cropImage } = useImageCrop()
  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const [profileName, setProfileName] = useState(name)
  const [profileDescription, setProfileDescription] = useState(description)
  const [profileAvatar, setProfileAvatar] = useState(avatar)
  const [profileCover, setProfileCover] = useState(cover)
  const [isUploadingCover, setUploadingCover] = useState(false)
  const [isUploadingAvatar, setUploadingAvatar] = useState(false)
  const [showUploadErrorModal, setShowUploadErrorModal] = useState(false)

  const imagesUtils: ImagesUtils = {
    avatar: {
      setLoading: setUploadingAvatar,
      updateImage: setProfileAvatar,
      responsiveSizes: SwarmProfile.avatarResponsiveSizes,
    },
    cover: {
      setLoading: setUploadingCover,
      updateImage: setProfileCover,
      responsiveSizes: SwarmProfile.coverResponsiveSizes,
    }
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        address: profileAddress,
        name: profileName || "",
        description: profileDescription,
        avatar: profileAvatar,
        cover: profileCover,
      })
    }
  }

  const handleRemoveImage = (e: React.SyntheticEvent, type: ImageType) => {
    e.preventDefault()
    e.stopPropagation()

    imagesUtils[type].updateImage(undefined)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: ImageType) => {
    const file = e.currentTarget.files![0]
    if (!file) return

    const img = await cropImage(file, type)

    if (img) {
      handleUploadImage(img as File, type)
    }
  }

  const handleUploadImage = async (file: File, type: ImageType) => {
    imagesUtils[type].setLoading(true)

    try {
      const responsiveImage = new SwarmImage(undefined, {
        beeClient,
        isResponsive: true,
        responsiveSizes: imagesUtils[type].responsiveSizes
      })
      await responsiveImage.setImageData(file)
      await responsiveImage.upload()

      imagesUtils[type].updateImage(responsiveImage)
    } catch (error) {
      console.error(error)
      setShowUploadErrorModal(true)
    }

    // reset inputs
    avatarRef.current!.value = ""
    coverRef.current!.value = ""

    imagesUtils[type].setLoading(false)
  }

  return (
    <div className="profile-info-edit">
      <div className="cover">
        <label
          className={classnames("cover-input", {
            active: !!profileCover?.originalSource,
          })}
          htmlFor="cover-input"
        >
          {profileCover && (
            <img
              src={profileCover.filePreview || profileCover.originalSource}
              alt={profileName}
              className="cover-image"
            />
          )}
          {isUploadingCover && (
            <div className="absolute inset-x-0 top-0 mt-24 text-center">Uploading...</div>
          )}
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            name="cover-input"
            id="cover-input"
            onChange={e => handleImageChange(e, "cover")}
          />
          <div className="cover-actions">
            {profileCover?.originalSource && (
              <Button className="remove-button" type="button" action={e => handleRemoveImage(e, "cover")}>
                &#10005;
              </Button>
            )}
            <div className="btn change-button">Change cover</div>
          </div>
        </label>
      </div>

      <div className="row items-center px-4">
        <label htmlFor="avatar-input">
          <div className="profile-avatar" data-label="Change Avatar">
            <img
              src={profileAvatar?.filePreview || profileAvatar?.originalSource || makeBlockies(profileAddress)}
              alt={profileName}
            />
            {isUploadingAvatar && (
              <div className="absolute inset-x-0 top-0 mt-12 text-center">Uploading...</div>
            )}
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              name="avatar-input"
              id="avatar-input"
              onChange={e => handleImageChange(e, "avatar")}
            />
          </div>
        </label>
        {!isSubmitting && (
          <Button className="ml-auto" action={handleSubmit} disabled={profileName === ""}>
            {submitLabel}
          </Button>
        )}
        {isSubmitting && (
          <Spinner className="ml-auto" width="30" />
        )}
      </div>

      <div className="row">
        <div className="col max-w-xxs p-4">
          <input
            type="text"
            placeholder="Profile name"
            value={profileName || ""}
            onChange={e => setProfileName(e.target.value || "")}
          />
        </div>
        <div className="flex-1 p-4">
          <label htmlFor="description">Profile description</label>
          <MarkdownEditor
            placeholder="Something about you or your profile"
            value={profileDescription || ""}
            onChange={value => setProfileDescription(value)}
          />
        </div>
      </div>

      <Modal show={showUploadErrorModal} setShow={setShowUploadErrorModal} showCloseButton={true}>
        <div className="flex">
          <p>There was an error trying to upload the image. Try again later.</p>
        </div>
      </Modal>
    </div>
  )
}

export default ProfileInfoEdit
