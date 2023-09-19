import React, { forwardRef, useImperativeHandle, useMemo } from "react"

import AvailabilityCard from "./cards/AvailabilityCard"
import EncodingUpgradeCard from "./cards/EncodingUpgradeCard"
import SaveToCard from "./cards/SaveToCard"
import SavingResultCard from "./cards/SavingResultCard"
import VideoDetailsCard from "./cards/VideoDetailsCard"
import VideoInputCard from "./cards/VideoInputCard"
import VideoProgressCard from "./cards/VideoProgressCard"
import VideoLoading from "./VideoLoading"
import { Container } from "@/components/ui/layout"
import useCharaterLimits from "@/hooks/useCharaterLimits"
import useEffectOnce from "@/hooks/useEffectOnce"
import useVideoEditor from "@/hooks/useVideoEditor"
import useVideoProcessing from "@/hooks/useVideoProcessing"
import useUserStore from "@/stores/user"
import useVideoEditorStore from "@/stores/video-editor"
import { cn } from "@/utils/classnames"

import type { Video } from "@etherna/sdk-js"

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
  const encodingStatus = useVideoEditorStore(state => state.encoding.status)
  const batchStatus = useVideoEditorStore(state => state.batch.status)
  const batchId = useVideoEditorStore(state => state.builder.detailsMeta.batchId)
  const videoTitle = useVideoEditorStore(state => state.builder.previewMeta.title)
  const videoDescription = useVideoEditorStore(state => state.builder.detailsMeta.description)
  const videoSources = useVideoEditorStore(state => state.builder.detailsMeta.sources)
  const editorStatus = useVideoEditorStore(state => state.status)
  const offerResources = useVideoEditorStore(state => state.offerResources)
  const pinContent = useVideoEditorStore(state => state.pinContent)
  const saveTo = useVideoEditorStore(state => state.saveTo)
  const inputFile = useVideoEditorStore(state => state.inputFile)
  const setInitialState = useVideoEditorStore(state => state.setInitialState)
  const resetState = useVideoEditorStore(state => state.reset)
  const { characterLimits } = useCharaterLimits({ autoFetch: true })
  const { isSaving, saveVideoTo } = useVideoEditor()

  useVideoProcessing()

  const isInitialInput = useMemo(() => {
    return editorStatus === "creating" && (!inputFile || video?.details?.sources.length === 0)
  }, [editorStatus, inputFile, video?.details?.sources.length])

  const needsReEncoding = useMemo(() => {
    const isWaiting = encodingStatus === "idle"
    return (
      isWaiting &&
      (video?.details?.sources.every(source => !["hls", "dash"].includes(source.type)) ?? false)
    )
  }, [encodingStatus, video?.details?.sources])

  const canSubmitVideo = useMemo(() => {
    return (
      !!batchId &&
      batchStatus === undefined &&
      !needsReEncoding &&
      videoTitle.length > 0 &&
      videoTitle.length <= (characterLimits?.title ?? 0) &&
      videoDescription.length <= (characterLimits?.description ?? 0) &&
      videoSources.length > 0
    )
  }, [
    batchId,
    batchStatus,
    needsReEncoding,
    characterLimits,
    videoTitle.length,
    videoDescription.length,
    videoSources.length,
  ])

  useImperativeHandle(ref, () => ({
    isEmpty: videoSources.length === 0,
    canSubmitVideo,
    submitVideo: () => saveVideoTo(saveTo, offerResources, pinContent),
    resetState,
  }))

  useEffectOnce(() => {
    setInitialState(address, video)
  }, [])

  if (video && editorStatus === "creating") return null

  return (
    <>
      <VideoLoading video={video}>
        {!isInitialInput && !needsReEncoding && editorStatus !== "saved" && (
          <VideoProgressCard className="mb-12" />
        )}

        {needsReEncoding && <EncodingUpgradeCard className="mb-12" />}

        <Container
          className={cn("gap-x-4 gap-y-8 md:items-start")}
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
              {(editorStatus === "creating" || editorStatus === "editing") && !isInitialInput && (
                <>
                  <SaveToCard disabled={isSaving} />
                  <AvailabilityCard disabled={isSaving} />
                </>
              )}
            </div>
          </Container>
          <Container className="flex-1 space-y-6 md:order-1" noPaddingX noPaddingY>
            {isInitialInput ? (
              <VideoInputCard />
            ) : editorStatus === "creating" || editorStatus === "editing" ? (
              <>
                <VideoDetailsCard
                  maxTitleLength={characterLimits?.title}
                  maxDescriptionLength={characterLimits?.description}
                  disabled={isSaving}
                />
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
