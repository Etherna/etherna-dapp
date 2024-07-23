import { fetchAddressFromEns, isEnsAddress } from "@etherna/sdk-js/utils"
import { useQuery } from "@tanstack/react-query"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import useClientsStore from "@/stores/clients"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"
import type { PlaylistIdentification } from "@etherna/sdk-js/swarm"
import type { UseQueryOptions } from "@tanstack/react-query"

interface UsePlaylistOptions {
  owner?: EthAddress | EnsAddress
  playlistIdentification: PlaylistIdentification
  enabled?: boolean
  fillEmptyState?: boolean
}

export const usePlaylistQuery = (opts: UsePlaylistOptions) => {
  return useQuery(usePlaylistQuery.getQueryConfig(opts))
}
usePlaylistQuery.getQueryConfig = (opts: UsePlaylistOptions) =>
  ({
    queryKey: usePlaylistQuery.getQueryKey(opts.playlistIdentification),
    queryFn: async () => {
      const beeClient = useClientsStore.getState().beeClient
      const reader = new SwarmPlaylist.Reader(opts.playlistIdentification, {
        beeClient,
      })

      try {
        const playlist = await reader.download({
          mode: "full",
        })

        return playlist
      } catch (err) {
        if (opts.fillEmptyState) {
          const error = err as Error
          if (error.message.includes("No epoch feed found")) {
            const ownerAddress =
              "owner" in opts.playlistIdentification
                ? opts.playlistIdentification.owner
                : (opts.owner ?? "0x0")
            const owner = isEnsAddress(ownerAddress)
              ? await fetchAddressFromEns(ownerAddress)
              : ownerAddress

            if (!owner || owner === "0x0") {
              throw new Error("Can't find address from ENS name")
            }

            const playlistId =
              "id" in opts.playlistIdentification ? opts.playlistIdentification.id : undefined
            const emptyPlaylist = SwarmPlaylist.Writer.emptyPlaylist(owner, playlistId)
            return emptyPlaylist
          }
        }
        throw err
      }
    },
    enabled: opts.enabled,
  }) satisfies UseQueryOptions
usePlaylistQuery.getQueryKey = (identification: PlaylistIdentification) =>
  [
    "playlist",
    "id" in identification ? identification.id : identification.rootManifest,
    "id" in identification ? identification.owner : null,
  ].filter(Boolean)
