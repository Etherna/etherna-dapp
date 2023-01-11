import { useCallback, useEffect, useRef, useState } from "react"

import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import { requiresMigration } from "@/utils/migrations"

import type { VideoWithIndexes } from "@/types/video"
import type { Reference } from "@etherna/api-js/clients"

export default function useBulkMigrations(
  videos: VideoWithIndexes[] | undefined,
  sourceType: "channel" | "index"
) {
  const beeClient = useClientsStore(state => state.beeClient)
  const [isLoading, setIsLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [videosToMigrate, setVideosToMigrate] = useState<Reference[]>([])
  const abortController = useRef<AbortController>()

  useEffect(() => {
    if (videos) {
      assertVideosVersions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos])

  const assertVideosVersions = useCallback(async () => {
    if (!videos) return

    if (isLoading) {
      abortController.current?.abort()
    }

    const controller = new AbortController()
    abortController.current = controller

    setIsLoading(true)

    if (sourceType === "index") {
      const videosResults = await Promise.allSettled(
        videos.map(video => {
          const swarmVideoReader = new SwarmVideo.Reader(video.reference, {
            beeClient,
          })
          return swarmVideoReader.download({
            mode: "full",
            signal: controller.signal,
          })
        })
      )
      const migrationVideos = videosResults
        .map((result, i) =>
          result.status === "fulfilled"
            ? result.value ?? { reference: videos[i].reference, preview: null }
            : null
        )
        .filter(video => {
          if (!video) return false
          return !video?.preview || requiresMigration(video.preview.v)
        })
        .map(video => video!.reference)

      if (!abortController.current.signal.aborted) {
        setVideosToMigrate(migrationVideos)
      }
    } else if (sourceType === "channel") {
      const migrationVideos = videos
        .filter(video => requiresMigration(video.preview.v))
        .map(video => video.reference)
      setVideosToMigrate(migrationVideos)
    }

    setIsLoading(false)
  }, [beeClient, isLoading, sourceType, videos])

  const migrate = useCallback(() => {
    setIsMigrating(true)
    setIsMigrating(false)
  }, [videos])

  console.log("M", videosToMigrate)

  return {
    videosToMigrate,
    isLoading,
    isMigrating,
    migrate,
  }
}
