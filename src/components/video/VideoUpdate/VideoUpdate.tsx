import React, { useEffect } from "react"
import { Redirect } from "react-router-dom"

import "./video-update.scss"
import { ReactComponent as NotFoundImage } from "@svg/backgrounds/404-illustration.svg"

import VideoEditor from "@components/media/VideoEditor"
import { Video } from "@classes/SwarmVideo/types"
import { VideoEditorContextProvider } from "@context/video-editor-context"
import useSwarmVideo from "@hooks/useSwarmVideo"
import Routes from "@routes"
import useSelector from "@state/useSelector"

type VideoUpdateProps = {
  hash: string
  routeState: Video | undefined
}

const VideoUpdate: React.FC<VideoUpdateProps> = ({ hash, routeState }) => {
  const { video, loadVideo } = useSwarmVideo({
    hash,
    fetchProfile: false,
    fetchFromCache: false,
    routeState
  })
  const { isSignedIn, address } = useSelector(state => state.user)
  const videoOnIndex = video?.isVideoOnIndex

  useEffect(() => {
    if (!video) {
      loadVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  if (
    video === undefined ||
    isSignedIn === undefined
  ) {
    return <div />
  }

  if (videoOnIndex && address !== video.ownerAddress) {
    return <Redirect to={Routes.getHomeLink()} />
  }

  return (
    <div className="video-update">
      {!videoOnIndex && (
        <div className="table mx-auto mt-32">
          <NotFoundImage width={320} />
          <h2 className="text-center text-gray-800 mt-12">Video not found</h2>
        </div>
      )}
      {videoOnIndex && (
        <VideoEditorContextProvider reference={hash} videoData={video}>
          <VideoEditor />
        </VideoEditorContextProvider>
      )}
    </div>
  )
}

export default VideoUpdate
