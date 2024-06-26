import { isValidReference } from "@etherna/sdk-js/utils"
import { useQuery } from "@tanstack/react-query"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import useClientsStore from "@/stores/clients"

import type { EthAddress, Reference } from "@etherna/sdk-js/clients"

type ReservedPlaylistId =
  | typeof SwarmPlaylist.Reader.channelPlaylistId
  | typeof SwarmPlaylist.Reader.savedPlaylistId

interface ChannelPlaylistOptions {
  owner: EthAddress
  playlist: ReservedPlaylistId | Reference
  enabled?: boolean
}

export const usePlaylistQuery = (opts: ChannelPlaylistOptions) => {
  const beeClient = useClientsStore(state => state.beeClient)

  return useQuery({
    queryKey: ["channel-playlist"],
    queryFn: async () => {
      const reference = isValidReference(opts.playlist) ? opts.playlist : undefined
      const reader = new SwarmPlaylist.Reader(reference, {
        beeClient,
        playlistId: opts.playlist,
        playlistOwner: opts.owner,
      })

      const playlist = await reader.download()

      return playlist
    },
    enabled: opts.enabled,
  })
}
