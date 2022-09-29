import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react"
import type { Video } from "@etherna/api-js"
import classNames from "classnames"

import OffersCard from "./cards/OffersCard"
import PostageBatchCard from "./cards/PostageBatchCard"
import SaveToCard from "./cards/SaveToCard"
import SavingResultCard from "./cards/SavingResultCard"
import VideoDetailsCard from "./cards/VideoDetailsCard"
import VideoSourcesCard from "./cards/VideoSourcesCard"
import { Container } from "@/components/ui/layout"
import useEffectOnce from "@/hooks/useEffectOnce"
import useVideoEditor from "@/hooks/useVideoEditor"
import useUserStore from "@/stores/user"
import useVideoEditorStore from "@/stores/video-editor"

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

const MAX_TITLE_LENGTH = 150
const MAX_DESCRIPTION_LENGTH = 5000

const VideoEditor = forwardRef<VideoEditorRef, VideoEditorProps>(({ video }, ref) => {
  const address = useUserStore(state => state.address!)
  const batchStatus = useVideoEditorStore(state => state.batchStatus)
  const batchId = useVideoEditorStore(state => state.video.batchId)
  const videoTitle = useVideoEditorStore(state => state.video.title)
  const videoDescription = useVideoEditorStore(state => state.video.description)
  const videoSources = useVideoEditorStore(state => state.video.sources)
  const editorStatus = useVideoEditorStore(state => state.status)
  const offerResources = useVideoEditorStore(state => state.offerResources)
  const queue = useVideoEditorStore(state => state.queue)
  const saveTo = useVideoEditorStore(state => state.saveTo)
  const setEditingVideo = useVideoEditorStore(state => state.setEditingVideo)
  const setOwnerAddress = useVideoEditorStore(state => state.setOwnerAddress)
  const resetState = useVideoEditorStore(state => state.reset)
  const { isSaving, saveVideoTo } = useVideoEditor()

  const canSubmitVideo = useMemo(() => {
    return (
      !!batchId &&
      batchStatus === undefined &&
      videoTitle.length > 0 &&
      videoTitle.length <= MAX_TITLE_LENGTH &&
      videoDescription.length <= MAX_DESCRIPTION_LENGTH &&
      videoSources.length > 0
    )
  }, [batchId, batchStatus, videoTitle, videoDescription, videoSources])

  const usePortal = useMemo(() => {
    return editorStatus === "creating" && videoSources.length === 0 && queue[0]?.name === "0p"
  }, [queue, videoSources, editorStatus])

  useImperativeHandle(ref, () => ({
    isEmpty: videoSources.length === 0,
    canSubmitVideo,
    submitVideo: () => saveVideoTo(saveTo, offerResources),
    resetState,
  }))

  useEffectOnce(() => {
    if (video) {
      setEditingVideo(video)
    }
  })

  useEffect(() => {
    if (!video) {
      setOwnerAddress(address)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (video && editorStatus === "creating") return null

  return (
    <>
      {usePortal && <div id={PORTAL_ID} />}
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
                <OffersCard disabled={isSaving} />
              </>
            )}
          </div>
        </Container>
        <Container className="flex-1 space-y-6 md:order-1" noPaddingX noPaddingY>
          {editorStatus === "creating" || editorStatus === "editing" ? (
            <>
              <VideoDetailsCard
                maxTitleLength={MAX_TITLE_LENGTH}
                maxDescriptionLength={MAX_DESCRIPTION_LENGTH}
                disabled={isSaving}
              />
              <VideoSourcesCard disabled={isSaving} />
            </>
          ) : (
            <SavingResultCard />
          )}
        </Container>
      </Container>
    </>
  )
})

export default VideoEditor
