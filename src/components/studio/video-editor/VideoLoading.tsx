import React, { useEffect, useState } from "react"

import { Spinner } from "@/components/ui/display"
import useClientsStore from "@/stores/clients"
import useVideoEditorStore from "@/stores/video-editor"

import type { Video } from "@etherna/api-js"

type VideoLoadingProps = {
  children: React.ReactNode
  video: Video | null | undefined
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ children, video }) => {
  const beeClient = useClientsStore(state => state.beeClient)
  const builderReference = useVideoEditorStore(state => state.builder.reference)
  const loadNode = useVideoEditorStore(state => state.loadNode)
  const [isLoading, setIsLoading] = useState(!!video)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!video) return
    if (hasLoaded) return
    // wait until initial state is set
    if (builderReference !== video.reference) return

    loadNode(beeClient).finally(() => {
      setIsLoading(false)
      setHasLoaded(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderReference])

  return (
    <div>
      {isLoading && (
        <div className="flex items-center justify-center">
          <Spinner size={24} className="m-auto" />
        </div>
      )}

      <div hidden={isLoading}>{children}</div>
    </div>
  )
}

export default VideoLoading
