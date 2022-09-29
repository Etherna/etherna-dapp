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
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { Video } from "@etherna/api-js"

import useMounted from "./useMounted"
import IndexClient from "@/classes/IndexClient"

type VideoIndexStatus = "public" | "processing" | "unindexed" | "error"

export default function useVideosIndexStatus(videos: Video[] | undefined, indexUrl: string) {
  const indexClient = useRef<IndexClient>()
  const [videosIndexStatus, setVideosIndexStatus] = useState<Record<string, VideoIndexStatus>>()
  const mounted = useMounted()

  useEffect(() => {
    indexClient.current = new IndexClient(indexUrl)

    setVideosIndexStatus(undefined)

    if (videos) {
      fetchVideosStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, indexUrl])

  const fetchVideosStatus = useCallback(async () => {
    if (!videos) return
    if (!mounted.current) return

    try {
      const data = await Promise.allSettled(
        videos.map(video => indexClient.current!.videos.fetchHashValidation(video.reference))
      )

      const videosIndexStatus = data.reduce((acc, promiseResult, i) => {
        const status: VideoIndexStatus =
          promiseResult.status === "rejected"
            ? "unindexed"
            : promiseResult.value.isValid === null
            ? "processing"
            : promiseResult.value.isValid
            ? "public"
            : "error"
        return {
          ...acc,
          [videos[i].reference]: status,
        }
      }, {} as Record<string, VideoIndexStatus>)

      mounted.current && setVideosIndexStatus(videosIndexStatus)
    } catch (error) {
      console.error(error)
    }
  }, [videos, mounted])

  return {
    videosIndexStatus,
  }
}
