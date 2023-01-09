import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"

import VideoLoading from "./VideoLoading"
import AvailabilityCard from "./cards/AvailabilityCard"
import PostageBatchCard from "./cards/PostageBatchCard"
import SaveToCard from "./cards/SaveToCard"
import SavingResultCard from "./cards/SavingResultCard"
import VideoDetailsCard from "./cards/VideoDetailsCard"
import VideoSourcesCard from "./cards/VideoSourcesCard"
import { Container } from "@/components/ui/layout"
import useCharaterLimits from "@/hooks/useCharaterLimits"
import useEffectOnce from "@/hooks/useEffectOnce"
import useVideoEditor from "@/hooks/useVideoEditor"
import useUserStore from "@/stores/user"
import useVideoEditorStore from "@/stores/video-editor"
import classNames from "@/utils/classnames"

import type { Video } from "@etherna/api-js"

export const PORTAL_ID = "video-drag-portal"

export type VideoEditorRef = {
  isEmpty: boolean
  canSubmitVideo: boolean
  submitVideo(): Promise<void>
  resetState(): void
}

type VideoEditorProps = {
  video: Video | null | undefined
}

const VideoEditor = forwardRef<VideoEditorRef, VideoEditorProps>(({ video }, ref) => {
  const address = useUserStore(state => state.address!)
  const batchStatus = useVideoEditorStore(state => state.batchStatus)
  const videoTitle = useVideoEditorStore(state => state.builder.previewMeta.title)
  const batchId = useVideoEditorStore(state => state.builder.detailsMeta.batchId)
  const videoDescription = useVideoEditorStore(state => state.builder.detailsMeta.description)
  const videoSources = useVideoEditorStore(state => state.builder.detailsMeta.sources)
  const editorStatus = useVideoEditorStore(state => state.status)
  const offerResources = useVideoEditorStore(state => state.offerResources)
  const pinContent = useVideoEditorStore(state => state.pinContent)
  const queue = useVideoEditorStore(state => state.queue)
  const saveTo = useVideoEditorStore(state => state.saveTo)
  const setInitialState = useVideoEditorStore(state => state.setInitialState)
  const resetState = useVideoEditorStore(state => state.reset)
  const { characterLimits } = useCharaterLimits({ autoFetch: true })
  const { isSaving, saveVideoTo } = useVideoEditor()

  const canSubmitVideo = useMemo(() => {
    return (
      !!batchId &&
      batchStatus === undefined &&
      videoTitle.length > 0 &&
      videoTitle.length <= (characterLimits?.title ?? 0) &&
      videoDescription.length <= (characterLimits?.description ?? 0) &&
      videoSources.length > 0
    )
  }, [
    batchId,
    batchStatus,
    characterLimits,
    videoTitle.length,
    videoDescription.length,
    videoSources.length,
  ])

  const usePortal = useMemo(() => {
    return editorStatus === "creating" && videoSources.length === 0 && queue[0]?.name === "0p"
  }, [queue, videoSources, editorStatus])

  useImperativeHandle(ref, () => ({
    isEmpty: videoSources.length === 0,
    canSubmitVideo,
    submitVideo: () => saveVideoTo(saveTo, offerResources, pinContent),
    resetState,
  }))

  useEffectOnce(() => {
    setInitialState(address, video)
  })

  if (video && editorStatus === "creating") return null

  return (
    <>
      {usePortal && <div id={PORTAL_ID} />}

      <VideoLoading video={video}>
        <Container
          className={classNames("gap-x-4 gap-y-8 md:items-start", {
            hidden: usePortal,
          })}
          noPaddingX
          noPaddingY
          row
          data-video-editor
        >
          <Container
            as="aside"
            className="w-full flex-grow-0 md:sticky md:top-20 md:order-2 md:w-64 lg:w-72"
            noPaddingX
            noPaddingY
          >
            <div className="grid grid-flow-row-dense grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
              {(editorStatus === "creating" || editorStatus === "editing") && (
                <>
                  <PostageBatchCard disabled={isSaving} />
                  <SaveToCard disabled={isSaving} />
                  <AvailabilityCard disabled={isSaving} />
                </>
              )}
            </div>
          </Container>
          <Container className="flex-1 space-y-6 md:order-1" noPaddingX noPaddingY>
            {editorStatus === "creating" || editorStatus === "editing" ? (
              <>
                <VideoDetailsCard
                  maxTitleLength={characterLimits?.title}
                  maxDescriptionLength={characterLimits?.description}
                  disabled={isSaving}
                />
                <VideoSourcesCard disabled={isSaving} />
              </>
            ) : (
              <SavingResultCard />
            )}
          </Container>
        </Container>
      </VideoLoading>
    </>
  )
})

export default VideoEditor
