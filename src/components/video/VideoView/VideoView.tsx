import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import "./video-view.scss"

import VideoStatusBadge from "../VideoStatusBadge"
import MarkdownPreview from "@common/MarkdownPreview"
import SEO from "@components/layout/SEO"
import Player from "@components/media/Player"
import Avatar from "@components/user/Avatar"
import VideoComments from "@components/video/VideoComments"
import { Video } from "@classes/SwarmVideo/types"
import Routes from "@routes"
import { showError } from "@state/actions/modals"
import useSwarmVideo from "@hooks/useSwarmVideo"
import { shortenEthAddr } from "@utils/ethFuncs"
import dayjs from "@utils/dayjs"
import VideoDetails from "../VideoDetails"

type VideoViewProps = {
  hash: string
  routeState?: Video
}

const VideoView: React.FC<VideoViewProps> = ({ hash, routeState }) => {
  const { video, loadVideo } = useSwarmVideo({
    hash,
    routeState,
    fetchFromCache: true,
    fetchProfile: true
  })
  const [isFetchingVideo, setIsFetchingVideo] = useState(false)

  useEffect(() => {
    if (!video?.hash) {
      fetchVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  const fetchVideo = async () => {
    setIsFetchingVideo(true)

    try {
      await loadVideo()
    } catch (error) {
      console.error(error)
      showError("Cannot load the video", error.message)
    }

    setIsFetchingVideo(false)
  }

  if (isFetchingVideo || !video) {
    return <div />
  }

  return (
    <>
      <SEO title={video.title || hash} />
      <div className="video-watch container">
        <div className="row justify-center">
          <div className="col lg:w-3/4">
            <Player
              sources={video.sources}
              originalQuality={video.originalQuality}
              thumbnail={video.thumbnail?.originalSource}
            />

            <VideoDetails video={video} />

            <VideoComments videoHash={hash} videoAuthorAddress={video.ownerAddress} />
          </div>

          <aside className="lg:w-1/4 hidden">
            {/* Eventually a sidebar */}
          </aside>
        </div>
      </div>
    </>
  )
}

export default VideoView
