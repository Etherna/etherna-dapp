import { isValidReference } from "@etherna/sdk-js/utils"
import { useQuery } from "@tanstack/react-query"

import IndexClient from "@/classes/IndexClient"

import type { UseQueryOptions } from "@tanstack/react-query"

interface UseIndexValidationOptions {
  identifier: string
  indexUrl: string
}

export const useIndexValidationQuery = (opts: UseIndexValidationOptions) => {
  return useQuery(useIndexValidationQuery.getQueryConfig(opts))
}
useIndexValidationQuery.getQueryConfig = (opts: UseIndexValidationOptions) =>
  ({
    queryKey: useIndexValidationQuery.getQueryKey(opts),
    queryFn: async () => {
      const indexClient = new IndexClient(opts.indexUrl)
      const indexValidation = await (isValidReference(opts.identifier)
        ? indexClient.videos.fetchHashValidation(opts.identifier)
        : indexClient.videos.fetchValidations(opts.identifier))

      return indexValidation
    },
  }) satisfies UseQueryOptions
useIndexValidationQuery.getQueryKey = (input: UseIndexValidationOptions) =>
  ["index-validation", input.indexUrl, input.identifier].filter(Boolean)
useIndexValidationQuery.getParamsFromKey = (key: string[]) => ({
  indexUrl: key[1],
  identifier: key[2],
})
