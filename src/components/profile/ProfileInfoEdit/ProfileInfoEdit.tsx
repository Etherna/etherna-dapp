import React, { useRef, useState } from "react"
import classnames from "classnames"

import "./profile-info-edit.scss"

import Button from "@common/Button"
import Modal from "@common/Modal"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import EnvActions from "@state/actions/enviroment"
import useSelector from "@state/useSelector"
import { getResourceUrl, uploadResourceToSwarm } from "@utils/swarm"
import makeBlockies from "@utils/makeBlockies"
import MarkdownEditor from "@components/common/MarkdownEditor"
import { Profile, SwarmImage } from "@utils/swarmProfile"

type ImageType = "avatar" | "cover"

type ProfileInfoEditProps = {
  profileAddress: string
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit?: (profile: Profile) => void
}

const ProfileInfoEdit = ({
  profileAddress,
  submitLabel = "Save",
  isSubmitting,
  onSubmit
}: ProfileInfoEditProps) => {
  const { name, description, avatar, cover } = useSelector(state => state.profile)
  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
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
        address: profileAddress,
        name: profileName || "",
        description: profileDescription,
        avatar: profileAvatar,
        cover: profileCover,
      })
    }
  }

  const handleRemoveImage = (e: React.SyntheticEvent, type: ImageType = "cover") => {
    e.stopPropagation()

    if (type === "cover") {
      setProfileCover(undefined)
    } else if (type === "avatar") {
      setProfileAvatar(undefined)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: ImageType = "cover") => {
    const file = e.currentTarget.files![0]
    if (!file) return

    const img = await EnvActions.cropImage(file, type)

    if (img) {
      handleUploadImage(img as File, type)
    }
  }

  const handleUploadImage = async (file: File, type: ImageType = "cover") => {
    type === "avatar" && setUploadingAvatar(true)
    type === "cover" && setUploadingCover(true)

    try {
      const imgHash = await uploadResourceToSwarm(file)
      const imgObj: SwarmImage = {
        url: getResourceUrl(imgHash)!,
        hash: imgHash,
        isRaw: false
      }

      if (type === "cover") {
        setProfileCover(imgObj)
      } else if (type === "avatar") {
        setProfileAvatar(imgObj)
      }
    } catch (error) {
      console.error(error)
      setShowUploadErrorModal(true)
    }

    // reset inputs
    avatarRef.current!.value = ""
    coverRef.current!.value = ""

    type === "avatar" && setUploadingAvatar(false)
    type === "cover" && setUploadingCover(false)
  }

  return (
    <div className="profile-info-edit">
      <div className="cover">
        <label
          className={classnames("cover-input", {
            active: !!profileCover?.url,
          })}
          htmlFor="cover-input"
        >
          {profileCover?.url && (
            <img src={profileCover.url} alt={profileName} className="cover-image" />
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
            {profileCover?.url && (
              <Button className="remove-button" type="button" action={e => handleRemoveImage(e, "cover")}>
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
              src={profileAvatar?.url || makeBlockies(profileAddress)}
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
