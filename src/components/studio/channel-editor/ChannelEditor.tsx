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

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import classNames from "classnames"

import classes from "@styles/components/studio/channel-editor/ChannelEditor.module.scss"
import { ReactComponent as TrashIcon } from "@assets/icons/trash.svg"

import Button from "@common/Button"
import MarkdownEditor from "@common/MarkdownEditor"
import TextField from "@common/TextField"
import SwarmProfileIO from "@classes/SwarmProfile"
import SwarmImageIO from "@classes/SwarmImage"
import useSwarmProfile from "@hooks/useSwarmProfile"
import useSelector from "@state/useSelector"
import { useProfileUpdate } from "@state/hooks/profile"
import { useErrorMessage, useImageCrop } from "@state/hooks/ui"
import makeBlockies from "@utils/makeBlockies"
import type { SwarmImage, SwarmImageRaw } from "@definitions/swarm-image"
import type { Profile } from "@definitions/swarm-profile"

type ImageType = "avatar" | "cover"

export type ChannelEditorHandler = {
  handleSubmit(): Promise<void>
}

type ChannelEditorProps = {
  profileAddress: string
}

type ImagesUtils = {
  [key in ImageType]: {
    setLoading: (loading: boolean) => void,
    setPreview: (dataURL: string | undefined) => void,
    updateImage: (image: SwarmImage | undefined) => void,
    responsiveSizes: number[]
  }
}

const ChannelEditor = forwardRef<ChannelEditorHandler, ChannelEditorProps>(({
  profileAddress,
}, ref) => {
  const { beeClient } = useSelector(state => state.env)
  const profile = useSelector(state => state.profile)
  const { cropImage } = useImageCrop()
  const { showError } = useErrorMessage()
  const updateProfile = useProfileUpdate(profileAddress)
  const { updateProfile: updateSwarmProfile } = useSwarmProfile({ address: profileAddress })

  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const [profileName, setProfileName] = useState(profile.name)
  const [profileDescription, setProfileDescription] = useState(profile.description)
  const [profileAvatar, setProfileAvatar] = useState(profile.avatar)
  const [profileCover, setProfileCover] = useState(profile.cover)
  const [avatarPreview, setAvatarPreview] = useState<string>()
  const [coverPreview, setCoverPreview] = useState<string>()
  const [isUploadingCover, setUploadingCover] = useState(false)
  const [isUploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    setProfileName(profile.name)
    setProfileDescription(profile.description)
    setProfileAvatar(profile.avatar)
    setProfileCover(profile.cover)
  }, [profile])

  const imagesUtils: ImagesUtils = {
    avatar: {
      setLoading: setUploadingAvatar,
      updateImage: setProfileAvatar,
      setPreview: setAvatarPreview,
      responsiveSizes: SwarmProfileIO.Reader.avatarResponsiveSizes,
    },
    cover: {
      setLoading: setUploadingCover,
      updateImage: setProfileCover,
      setPreview: setCoverPreview,
      responsiveSizes: SwarmProfileIO.Reader.coverResponsiveSizes,
    }
  }

  useImperativeHandle(ref, () => ({
    handleSubmit
  }))

  const handleSubmit = async () => {
    if (!profileName) {
      return showError("Set your name", "Please provide a name for your channel before submitting.")
    }

    try {
      const profileInfo: Profile = {
        address: profileAddress,
        name: profileName || "",
        description: profileDescription ?? null,
        avatar: profileAvatar ?? null,
        cover: profileCover ?? null,
      }
      const newReference = await updateSwarmProfile(profileInfo)

      updateProfile(newReference, profileInfo)

      // clear prefetch
      window.prefetchData = undefined
    } catch (error: any) {
      console.error(error)
      showError("Cannot save profile", error.message)
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

  const swarmImageUrl = (image: SwarmImageRaw | null | undefined) => {
    const reference = SwarmImageIO.Reader.getOriginalSourceReference(image)
    return reference ? beeClient.getBzzUrl(reference) : undefined
  }

  const handleUploadImage = async (file: File, type: ImageType) => {
    imagesUtils[type].setLoading(true)

    try {
      const imageWriter = new SwarmImageIO.Writer(file, {
        beeClient,
        isResponsive: true,
        responsiveSizes: imagesUtils[type].responsiveSizes
      })
      imagesUtils[type].setPreview(await imageWriter.getFilePreview())
      const rawImage = await imageWriter.upload()
      const imageReader = new SwarmImageIO.Reader(rawImage, { beeClient })
      imagesUtils[type].setPreview(undefined)

      imagesUtils[type].updateImage(imageReader.image)
    } catch (error: any) {
      console.error(error)
      showError("Cannot upload the image", error.message)
    }

    // reset inputs
    avatarRef.current!.value = ""
    coverRef.current!.value = ""

    imagesUtils[type].setLoading(false)
  }

  return (
    <div className={classes.channelEditor}>
      <div className={classes.cover}>
        <label
          className={classNames(classes.coverInput, {
            [classes.hasCover]: !!profileCover,
          })}
          htmlFor="cover-input"
        >
          {profileCover && (
            <img
              src={coverPreview || swarmImageUrl(profileCover)}
              alt={profileName}
              className={classes.coverImage}
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
          <div className={classes.coverActions}>
            {profileCover && (
              <Button
                className={classNames(classes.btn, classes.removeButton)}
                type="button"
                modifier="muted"
                onClick={e => handleRemoveImage(e, "cover")}
              >
                <TrashIcon />
              </Button>
            )}
            <Button as="div" modifier="muted" className={classNames(classes.btn)}>
              Change cover
            </Button>
          </div>
        </label>
      </div>

      <div className="w-full">
        <label className="inline-block w-auto" htmlFor="avatar-input">
          <div className={classes.profileAvatar} data-label="Change Avatar">
            <img
              src={avatarPreview || swarmImageUrl(profileAvatar) || makeBlockies(profileAddress)}
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
      </div>

      <div>
        <label htmlFor="description">Channel name</label>
        <TextField
          type="text"
          value={profileName || ""}
          onChange={val => setProfileName(val || "")}
        />
      </div>

      <div>
        <label htmlFor="description">Channel description</label>
        <MarkdownEditor
          placeholder="Write something about you"
          value={profileDescription}
          onChange={value => setProfileDescription(value)}
        />
      </div>
    </div>
  )
})
ChannelEditor.displayName = "ChannelEditor"

export default ChannelEditor
