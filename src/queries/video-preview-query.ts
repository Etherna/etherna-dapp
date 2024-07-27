import { useQuery } from "@tanstack/react-query"

import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"

import type { Reference } from "@etherna/sdk-js/clients"
import type { UseQueryOptions } from "@tanstack/react-query"

interface UseProfilePreviewOptions {
  reference: Reference
}

export const useVideoPreviewQuery = (opts: UseProfilePreviewOptions) => {
  return useQuery(useVideoPreviewQuery.getQueryConfig(opts))
}
useVideoPreviewQuery.getQueryConfig = (opts: UseProfilePreviewOptions) =>
  ({
    queryKey: useVideoPreviewQuery.getQueryKey(opts.reference),
    queryFn: async () => {
      const reader = new SwarmVideo.Reader(opts.reference, {
        beeClient: useClientsStore.getState().beeClient,
      })
      const video = await reader.download({ mode: "preview" })
      return video
    },
  }) satisfies UseQueryOptions
useVideoPreviewQuery.getQueryKey = (reference: Reference) => ["video-preview", reference]
