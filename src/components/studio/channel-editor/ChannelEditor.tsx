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

import { TrashIcon } from "@heroicons/react/outline"

import WalletState from "../other/WalletState"
import SwarmImageIO from "@/classes/SwarmImage"
import SwarmProfileIO from "@/classes/SwarmProfile"
import MarkdownEditor from "@/components/common/MarkdownEditor"
import { Button } from "@/components/ui/actions"
import { TextInput } from "@/components/ui/inputs"
import type { SwarmImage, SwarmImageRaw } from "@/definitions/swarm-image"
import type { Profile } from "@/definitions/swarm-profile"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import { useWallet } from "@/state/hooks/env"
import { useProfileUpdate } from "@/state/hooks/profile"
import { useErrorMessage, useImageCrop } from "@/state/hooks/ui"
import useSelector from "@/state/useSelector"
import makeBlockies from "@/utils/makeBlockies"
import { isAnimatedImage } from "@/utils/media"

type ImageType = "avatar" | "cover"

export type ChannelEditorHandler = {
  handleSubmit(): Promise<void>
}

type ChannelEditorProps = {
  profileAddress: string
}

type ImagesUtils = {
  [key in ImageType]: {
    setLoading: (loading: boolean) => void
    setPreview: (dataURL: string | undefined) => void
    updateImage: (image: SwarmImage | undefined) => void
    responsiveSizes: number[]
  }
}

const ChannelEditor = forwardRef<ChannelEditorHandler, ChannelEditorProps>(
  ({ profileAddress }, ref) => {
    const beeClient = useSelector(state => state.env.beeClient)
    const defaultBatch = useSelector(state => state.user.defaultBatch)
    const profile = useSelector(state => state.profile)
    const { cropImage } = useImageCrop()
    const { showError } = useErrorMessage()
    const updateProfile = useProfileUpdate(profileAddress)
    const { updateProfile: updateSwarmProfile } = useSwarmProfile({ address: profileAddress })

    const { isLocked } = useWallet()

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
    const [hasExceededLimit, setHasExceededLimit] = useState(false)

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
      },
    }

    useImperativeHandle(ref, () => ({
      handleSubmit,
    }))

    const handleSubmit = async () => {
      if (!defaultBatch) {
        return showError("Cannot upload", "You don't have any storage yet.")
      }

      if (isLocked) {
        return showError("Wallet Locked", "Please unlock your wallet before saving.")
      }

      if (!profileName) {
        return showError(
          "Set your name",
          "Please provide a name for your channel before submitting."
        )
      }

      if (hasExceededLimit) {
        return showError(
          "Channel description is too long",
          "Please provide a shorter bio. Limit is 5000 characters."
        )
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

      if (isAnimatedImage(new Uint8Array(await file.arrayBuffer()))) {
        return showError("Wrong image format", "Animated images are not allowed")
      }

      // reset input
      e.target.value = ""

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
          responsiveSizes: imagesUtils[type].responsiveSizes,
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
      <div className="flex flex-col flex-wrap space-y-6">
        <WalletState />

        <div className="relative w-full min-h-44 bg-gray-200/90 dark:bg-gray-800/50 rounded-md overflow-hidden">
          <label
            className={classNames("absolute inset-0 m-0 overflow-hidden", {
              "h-auto": !!profileCover,
            })}
            htmlFor="cover-input"
          >
            {profileCover && (
              <img
                src={coverPreview || swarmImageUrl(profileCover)}
                alt={profileName}
                className="w-full h-full object-cover rounded-md overflow-hidden"
              />
            )}
            {isUploadingCover && (
              <div className="absolute inset-x-0 top-0 mt-24 text-center">Uploading...</div>
            )}
            <input
              className="hidden"
              ref={coverRef}
              type="file"
              accept="image/*"
              name="cover-input"
              id="cover-input"
              onChange={e => handleImageChange(e, "cover")}
            />
            <div
              className={classNames(
                "mb-3 mr-3 space-x-2 absolute bottom-0 right-0 flex items-center justify-center"
              )}
            >
              {profileCover && (
                <Button
                  className={classNames(
                    "h-8 rounded-full normal-case cursor-pointer",
                    "w-8 p-0 justify-center"
                  )}
                  type="button"
                  color="muted"
                  onClick={e => handleRemoveImage(e, "cover")}
                >
                  <TrashIcon className="h-4 m-auto" aria-aria-hidden />
                </Button>
              )}
              <Button
                as="div"
                color="muted"
                className={classNames("h-8 py-1 rounded-full normal-case cursor-pointer")}
              >
                Change cover
              </Button>
            </div>
          </label>
        </div>

        <div className="w-full">
          <label className="inline-block w-auto" htmlFor="avatar-input">
            <div
              className={classNames(
                "group relative w-40 h-40 border-4 rounded-full overflow-hidden cursor-pointer",
                "border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700"
              )}
            >
              <img
                className="w-full h-full object-cover"
                src={avatarPreview || swarmImageUrl(profileAvatar) || makeBlockies(profileAddress)}
                alt={profileName}
              />
              {isUploadingAvatar && <div className="absolute-center text-center">Uploading...</div>}
              <input
                className="hidden"
                ref={avatarRef}
                type="file"
                accept="image/*"
                name="avatar-input"
                id="avatar-input"
                onChange={e => handleImageChange(e, "avatar")}
              />
              <span
                className={classNames(
                  "absolute-center",
                  "opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                )}
              >
                Change avatar
              </span>
            </div>
          </label>
        </div>

        <div>
          <label htmlFor="description">Channel name</label>
          <TextInput
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
            charactersLimit={5000}
            onCharacterLimitChange={setHasExceededLimit}
            onChange={value => setProfileDescription(value)}
          />
        </div>
      </div>
    )
  }
)
ChannelEditor.displayName = "ChannelEditor"

export default ChannelEditor
