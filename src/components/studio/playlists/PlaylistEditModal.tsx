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

import React, { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { PlaylistBuilder, ProfileBuilder } from "@etherna/sdk-js/swarm"
import { EmptyReference } from "@etherna/sdk-js/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { z, ZodError } from "zod"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmProfile from "@/classes/SwarmProfile"
import { Button, Modal } from "@/components/ui/actions"
import { Alert, FormGroup, Label } from "@/components/ui/display"
import { TextInput } from "@/components/ui/inputs"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useErrorMessage from "@/hooks/useErrorMessage"
import { useChannelPlaylistsQuery } from "@/queries/channel-playlists-query"
import { usePlaylistPreviewQuery } from "@/queries/playlist-preview-query"
import { usePlaylistQuery } from "@/queries/playlist-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"

import type { Playlist } from "@etherna/sdk-js"

type PlaylistEditModalProps = {
  open: boolean
  playlist?: Playlist
  onClose?: () => void
  onSave?: (playlist: Playlist) => void
}

const PlaylistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  desciption: z.string(),
})

const PlaylistEditModal: React.FC<PlaylistEditModalProps> = ({
  open,
  playlist,
  onClose,
  onSave,
}) => {
  const isCreating = !playlist
  const owner = useUserStore(state => state.address ?? "0x0")
  const profile = useUserStore(state => state.profile)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const beeClient = useClientsStore(state => state.beeClient)
  const { fetchBestUsableBatch } = useDefaultBatch({
    autofetch: !defaultBatchId,
    saveAfterCreate: false,
  })
  const { showError } = useErrorMessage()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof PlaylistSchema>>({
    resolver: zodResolver(PlaylistSchema),
    defaultValues: {
      name: playlist?.preview.name ?? "",
      desciption: playlist?.details.description ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      name: playlist?.preview.name ?? "",
      desciption: playlist?.details.description ?? "",
    })
  }, [form, playlist])

  const handleSave = async (values: z.infer<typeof PlaylistSchema>) => {
    try {
      let batchId = defaultBatchId

      if (!batchId) {
        const batch = await fetchBestUsableBatch()
        batchId = batch?.id
      }

      if (!batchId) {
        showError("Default postage batch not loaded or not created yet")
        return
      }

      const profileReader = new SwarmProfile.Reader(owner, {
        beeClient,
        prefetchData: profile ? { preview: profile } : undefined,
      })
      const profilePromise = isCreating
        ? profileReader.download({ mode: "full" })
        : Promise.resolve(null)

      const builder = new PlaylistBuilder()

      builder.initialize(
        playlist?.reference ?? EmptyReference,
        owner,
        playlist?.preview,
        playlist?.details
      )

      await builder.loadNode({
        beeClient,
      })

      builder.updateName(values.name, "preview")
      builder.updateDescription(values.desciption)

      const playlistWriter = new SwarmPlaylist.Writer(builder, {
        beeClient,
      })

      const savedPlaylist = await playlistWriter.upload({
        batchId: defaultBatchId,
      })

      await queryClient.invalidateQueries({
        exact: true,
        queryKey: usePlaylistPreviewQuery.getQueryKey(owner, {
          rootManifest: savedPlaylist.preview.rootManifest,
        }),
      })
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: usePlaylistQuery.getQueryKey(owner, {
          rootManifest: savedPlaylist.preview.rootManifest,
        }),
      })

      if (isCreating) {
        const profile = await profilePromise

        const profileBuilder = new ProfileBuilder()
        profileBuilder.initialize(
          profile?.reference ?? EmptyReference,
          profile?.preview ?? {
            name: "",
            avatar: null,
            address: owner,
            batchId,
          },
          profile?.details
        )

        profileBuilder.addPlaylist(savedPlaylist.preview.rootManifest)

        const userPlaylistsWriter = new SwarmProfile.Writer(profileBuilder, {
          beeClient,
        })

        await userPlaylistsWriter.upload({
          batchId,
        })
      }

      await queryClient.invalidateQueries({
        exact: true,
        queryKey: useChannelPlaylistsQuery.getQueryKey(owner),
      })

      onSave?.(savedPlaylist)
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message: (error as Error).message,
      })

      if (error instanceof ZodError) {
        console.error(error.issues)
      }
    }
  }

  const handleClose = () => {
    form.reset()
    onClose?.()
  }

  return (
    <Modal
      show={open}
      showCancelButton={!form.formState.isSubmitting}
      title={isCreating ? "Create playlist" : "Edit playlist"}
      footerButtons={
        <Button loading={form.formState.isSubmitting} onClick={form.handleSubmit(handleSave)}>
          {isCreating ? "Create" : "Save"}
        </Button>
      }
      onClose={handleClose}
      large
    >
      <form onSubmit={form.handleSubmit(handleSave)}>
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormGroup>
              <Label>Name</Label>
              <TextInput {...field} />
            </FormGroup>
          )}
        />
        <Controller
          control={form.control}
          name="desciption"
          render={({ field }) => (
            <FormGroup>
              <Label>Description</Label>
              <TextInput {...field} multiline />
            </FormGroup>
          )}
        />

        {form.formState.errors.root && (
          <Alert color="error">{form.formState.errors.root.message}</Alert>
        )}
      </form>
    </Modal>
  )
}

export default PlaylistEditModal
