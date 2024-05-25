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

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { ProfileDeserializer } from "@etherna/sdk-js/serializers"

import { TrashIcon } from "@heroicons/react/24/outline"

import SwarmImage from "@/classes/SwarmImage"
import Img from "@/components/common/Image"
import MarkdownEditor from "@/components/common/MarkdownEditor"
import WalletState from "@/components/studio/other/WalletState"
import { Button } from "@/components/ui/actions"
import { TextInput } from "@/components/ui/inputs"
import useErrorMessage from "@/hooks/useErrorMessage"
import useImageCrop from "@/hooks/useImageCrop"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import useWallet from "@/hooks/useWallet"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"
import makeBlockies from "@/utils/make-blockies"
import { isAnimatedImage } from "@/utils/media"

import type { Image, ImageRaw } from "@etherna/sdk-js"
import type { EthAddress } from "@etherna/sdk-js/clients"

type ImageType = "avatar" | "cover"

export type ChannelEditorHandler = {
  handleSubmit(): Promise<void>
}

type ChannelEditorProps = {
  profileAddress: EthAddress
}

type ImagesUtils = {
  [key in ImageType]: {
    setPreview: (dataURL: string | undefined) => void
    responsiveSizes: number[]
  }
}

const ChannelEditor = forwardRef<ChannelEditorHandler, ChannelEditorProps>(
  ({ profileAddress }, ref) => {
    const beeClient = useClientsStore(state => state.beeClient)
    const defaultBatchId = useUserStore(state => state.defaultBatchId)
    const profile = useUserStore(state => state.profile)
    const ens = useUserStore(state => state.ens)
    const updateProfile = useUserStore(state => state.setProfile)
    const { cropImage } = useImageCrop()
    const { showError } = useErrorMessage()
    const {
      builder,
      isLoading,
      loadProfile,
      updateProfile: updateSwarmProfile,
    } = useSwarmProfile({
      mode: "full",
      address: profileAddress,
    })

    const { isLocked } = useWallet()

    const avatarRef = useRef<HTMLInputElement>(null)
    const coverRef = useRef<HTMLInputElement>(null)
    const [profileName, setProfileName] = useState(profile?.name ?? "")
    const [profileDescription, setProfileDescription] = useState("")
    const [profileAvatar, setProfileAvatar] = useState(profile?.avatar)
    const [profileCover, setProfileCover] = useState<Image | null>()
    const [avatarPreview, setAvatarPreview] = useState<string>()
    const [coverPreview, setCoverPreview] = useState<string>()
    const [hasExceededLimit, setHasExceededLimit] = useState(false)

    useEffect(() => {
      async function load() {
        const profile = await loadProfile()
        builder.initialize(profile.reference, profile.preview, profile.details)
        await builder.loadNode({ beeClient })

        setProfileName(profile.preview.name)
        setProfileDescription(profile.details?.description ?? "")
        setProfileAvatar(profile.preview.avatar)
        setProfileCover(profile.details?.cover)
      }

      load()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile])

    const imagesUtils: ImagesUtils = useMemo(() => {
      return {
        avatar: {
          setPreview: setAvatarPreview,
          responsiveSizes: SwarmImage.Writer.avatarResponsiveSizes,
        },
        cover: {
          setPreview: setCoverPreview,
          responsiveSizes: SwarmImage.Writer.defaultResponsiveSizes,
        },
      }
    }, [])

    useImperativeHandle(ref, () => ({
      handleSubmit,
    }))

    const handleSubmit = useCallback(async () => {
      if (!defaultBatchId) {
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
        builder.updateName(profileName)
        builder.updateDescription(profileDescription)

        await updateSwarmProfile(builder)

        const deserializer = new ProfileDeserializer(beeClient.url)
        updateProfile(
          deserializer.deserializePreview(JSON.stringify(builder.previewMeta), {
            reference: builder.reference,
          }),
          ens ?? null
        )

        // clear prefetch
        window.prefetchData = undefined
      } catch (error: any) {
        console.error(error)
        showError("Cannot save profile", error.message)
      }
    }, [
      defaultBatchId,
      isLocked,
      profileName,
      hasExceededLimit,
      builder,
      profileDescription,
      beeClient.url,
      ens,
      showError,
      updateSwarmProfile,
      updateProfile,
    ])

    const handleUploadImage = useCallback(
      async (file: File, type: ImageType) => {
        try {
          const batchId = profile?.batchId ?? (await beeClient.stamps.fetchBestBatchId())

          if (!batchId) {
            throw new Error("BatchId not correctly loaded. Please try refreshing the page.")
          }

          const imageWriter = new SwarmImage.Writer(file, {
            beeClient,
            responsiveSizes: imagesUtils[type].responsiveSizes,
          })
          imagesUtils[type].setPreview(await imageWriter.getFilePreview())

          const processedImage = await imageWriter.pregenerateImages()

          await Promise.all(
            processedImage.responsiveSourcesData.map(({ data }) => {
              beeClient.bytes.upload(data, {
                batchId,
                pin: false,
              })
            })
          )

          const rawImage = {
            aspectRatio: processedImage.aspectRatio,
            blurhash: processedImage.blurhash,
            sources: [],
          } satisfies ImageRaw

          switch (type) {
            case "avatar":
              builder.previewMeta.avatar = rawImage
              break
            case "cover":
              builder.detailsMeta.cover = rawImage
              break
          }

          for (const source of processedImage?.responsiveSourcesData || []) {
            switch (type) {
              case "avatar":
                builder.addAvatarSource(source.data, source.width, source.type)
                break
              case "cover":
                builder.addCoverSource(source.data, source.width, source.type)
                break
            }
          }
        } catch (error: any) {
          console.error(error)
          showError("Cannot upload the image", error.message)
        }

        // reset inputs
        avatarRef.current!.value = ""
        coverRef.current!.value = ""
      },
      [beeClient, builder, imagesUtils, profile?.batchId, showError]
    )

    const handleRemoveImage = useCallback(
      (e: React.SyntheticEvent, type: ImageType) => {
        e.preventDefault()
        e.stopPropagation()

        imagesUtils[type].setPreview(undefined)

        switch (type) {
          case "avatar":
            builder.removeAvatar()
            break
          case "cover":
            builder.removeCover()
            break
        }
      },
      [builder, imagesUtils]
    )

    const handleImageChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>, type: ImageType) => {
        const file = e.currentTarget.files![0]
        if (!file) return

        if (isAnimatedImage(new Uint8Array(await file.arrayBuffer()))) {
          return showError("Wrong image format", "Animated images are not allowed")
        }

        const img = await cropImage(file, type)

        // reset input
        e.target.value = ""

        if (img) {
          handleUploadImage(img as File, type)
        } else {
          showError("Cannot upload the image", "Image crop failed.")
        }
      },
      [cropImage, handleUploadImage, showError]
    )

    return (
      <div className="flex flex-col flex-wrap space-y-6">
        <WalletState />

        <div className="relative min-h-44 w-full overflow-hidden rounded-md bg-gray-200/90 dark:bg-gray-800/50">
          <label
            className={cn("absolute inset-0 m-0 overflow-hidden", {
              "h-auto": !!profileCover,
            })}
            htmlFor="cover-input"
          >
            {(coverPreview || profileCover) && (
              <Img
                className="h-full w-full overflow-hidden rounded-md object-cover"
                src={coverPreview}
                sources={coverPreview ? undefined : profileCover?.sources}
                alt={profileName}
              />
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
              className={cn(
                "absolute bottom-0 right-0 mb-3 mr-3 flex items-center justify-center space-x-2"
              )}
            >
              {profileCover && (
                <Button
                  className={cn(
                    "h-8 cursor-pointer rounded-full normal-case",
                    "w-8 justify-center p-0"
                  )}
                  type="button"
                  color="muted"
                  onClick={e => handleRemoveImage(e, "cover")}
                >
                  <TrashIcon className="m-auto h-4" aria-hidden />
                </Button>
              )}
              <Button
                as="div"
                color="muted"
                className={cn("h-8 cursor-pointer rounded-full py-1 normal-case")}
              >
                Change cover
              </Button>
            </div>
          </label>
        </div>

        <div className="w-full">
          <label className="inline-block w-auto" htmlFor="avatar-input">
            <div
              className={cn(
                "group relative h-40 w-40 cursor-pointer overflow-hidden rounded-full border-4",
                "border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700"
              )}
            >
              <Img
                className="h-full w-full object-cover"
                src={avatarPreview || makeBlockies(profileAddress)}
                sources={avatarPreview ? undefined : profileAvatar?.sources}
                alt={profileName}
              />
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
                className={cn(
                  "z-10 text-center leading-none absolute-center",
                  "shadow-black text-shadow",
                  "hidden transition-opacity duration-200 group-hover:block"
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
            initialValue={profileDescription}
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
