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

import React from "react"
import { Controller, useForm } from "react-hook-form"
import { PlaylistBuilder } from "@etherna/sdk-js/swarm"
import { EmptyReference } from "@etherna/sdk-js/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { z, ZodError } from "zod"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmUserPlaylists from "@/classes/SwarmUserPlaylists"
import { Button, Modal } from "@/components/ui/actions"
import { Alert, FormGroup, Label } from "@/components/ui/display"
import { Select, TextInput } from "@/components/ui/inputs"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useErrorMessage from "@/hooks/useErrorMessage"
import { usePlaylistPreviewQuery } from "@/queries/playlist-preview-query"
import { usePlaylistQuery } from "@/queries/playlist-query"
import { useUserPlaylistsQuery } from "@/queries/user-playlists-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"

import type { Playlist } from "@etherna/sdk-js"

type PlaylistEditModalProps = {
  className?: string
  show?: boolean
  playlist?: Playlist
  onClose?: () => void
  onSave?: (playlist: Playlist) => void
}

const PlaylistSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    desciption: z.string(),
    type: z.enum(["public", "private", "protected"]),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "protected" && !data.password) {
      ctx.addIssue({
        code: "custom",
        message: "Password is required",
      })
    }
  })

const PlaylistEditModal: React.FC<PlaylistEditModalProps> = ({
  className,
  show = false,
  playlist,
  onClose,
  onSave,
}) => {
  const isCreating = !playlist
  const isReservedPlaylist = [
    SwarmPlaylist.Reader.savedPlaylistId,
    SwarmPlaylist.Reader.channelPlaylistId,
  ].includes(playlist?.preview.id ?? "")

  const owner = useUserStore(state => state.address ?? "0x0")
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const beeClient = useClientsStore(state => state.beeClient)
  const { fetchDefaultBatchIdOrCreate } = useDefaultBatch({
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
      type: playlist?.preview.type ?? "public",
    },
  })

  const type = form.watch("type")

  const handleSave = async (values: z.infer<typeof PlaylistSchema>) => {
    try {
      const batchId = await fetchDefaultBatchIdOrCreate()

      if (!batchId) {
        showError("Default postage batch not loaded or not created yet")
        return
      }

      const userPlaylistsReader = new SwarmUserPlaylists.Reader(owner, {
        beeClient,
      })
      const userPlaylistsPromise = isCreating ? userPlaylistsReader.download() : Promise.resolve([])

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

      if (values.password) {
        builder.setEncryptionPassword(values.password)
      }

      builder.updateName(values.name, "preview")
      builder.updateType(values.type)
      builder.updateDescription(values.desciption)

      const playlistWriter = new SwarmPlaylist.Writer(builder, {
        beeClient,
      })

      const savedPlaylist = await playlistWriter.upload({
        batchId: defaultBatchId,
      })

      if (isCreating) {
        const playlists = await userPlaylistsPromise
        playlists.push(savedPlaylist.preview.rootManifest)

        const userPlaylistsWriter = new SwarmUserPlaylists.Writer(playlists, {
          beeClient,
        })

        await userPlaylistsWriter.upload({
          batchId: defaultBatchId,
        })
      }

      await queryClient.invalidateQueries({
        exact: true,
        queryKey: useUserPlaylistsQuery.getQueryKey(owner),
      })
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: usePlaylistPreviewQuery.getQueryKey(owner, {
          rootManifest: savedPlaylist.preview.rootManifest,
        }),
      })
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: usePlaylistQuery.getQueryKey({
          rootManifest: savedPlaylist.preview.rootManifest,
        }),
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
      className={className}
      show={show}
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
              <TextInput
                {...field}
                value={
                  isReservedPlaylist
                    ? (() => {
                        switch (playlist?.preview.id) {
                          case SwarmPlaylist.Reader.savedPlaylistId:
                            return "Saved videos"
                          case SwarmPlaylist.Reader.channelPlaylistId:
                            return "Channel videos"
                          default:
                            return "-"
                        }
                      })()
                    : field.value
                }
                disabled={isReservedPlaylist || field.disabled}
              />
            </FormGroup>
          )}
        />
        <Controller
          control={form.control}
          name="desciption"
          render={({ field }) => (
            <FormGroup>
              <Label>Description</Label>
              <TextInput {...field} multiline disabled={isReservedPlaylist || field.disabled} />
            </FormGroup>
          )}
        />
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormGroup>
              <Label>Visibility</Label>
              <Select
                {...field}
                options={[
                  {
                    value: "public",
                    label: "Public",
                  },
                  {
                    value: "private",
                    label: "Private",
                    disabled: true,
                    description: "Coming later...",
                  },
                  {
                    value: "protected",
                    label: "Password protected",
                    disabled: true,
                    description: "Coming later...",
                  },
                ]}
              />
            </FormGroup>
          )}
        />
        {type === "protected" && (
          <Controller
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormGroup>
                <Label>Password</Label>
                <TextInput {...field} value={field.value ?? ""} type="password" />
              </FormGroup>
            )}
          />
        )}

        {form.formState.errors.root && (
          <Alert color="error">{form.formState.errors.root.message}</Alert>
        )}
      </form>
    </Modal>
  )
}

export default PlaylistEditModal
