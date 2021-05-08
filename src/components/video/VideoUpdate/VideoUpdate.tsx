import React, { useEffect } from "react"
import { Redirect } from "react-router-dom"

import "./video-update.scss"

import { ReactComponent as NotFoundImage } from "@svg/backgrounds/404-illustration.svg"

import { Video } from "@classes/SwarmVideo/types"
import useSelector from "@state/useSelector"
import Routes from "@routes"
import VideoEditorContextWrapper from "@components/media/VideoEditor/context/ContextWrapper"
import VideoEditor from "@components/media/VideoEditor"
import useSwarmVideo from "@hooks/useSwarmVideo"

type VideoUpdateProps = {
  hash: string
  routeState: Video | undefined
}

const VideoUpdate: React.FC<VideoUpdateProps> = ({ hash, routeState }) => {
  const [video, loadVideo] = useSwarmVideo({
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
        <VideoEditorContextWrapper reference={hash} videoData={video}>
          <VideoEditor />
        </VideoEditorContextWrapper>
      )}
    </div>
  )
}

export default VideoUpdate
