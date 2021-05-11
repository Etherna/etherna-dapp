import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import moment from "moment"

import "./video-view.scss"

import MarkdownPreview from "@common/MarkdownPreview"
import SEO from "@components/layout/SEO"
import Player from "@components/media/Player"
import Avatar from "@components/user/Avatar"
import Routes from "@routes"
import { Video } from "@classes/SwarmVideo/types"
import useSwarmVideo from "@hooks/useSwarmVideo"
import { showError } from "@state/actions/modals"
import { shortenEthAddr } from "@utils/ethFuncs"
import VideoStatusBadge from "../VideoStatusBadge"

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

            <div className="video-info">
              <h1 className="video-title">{video.title ?? ""}</h1>
              <VideoStatusBadge status={video.isVideoOnIndex ? "available" : "unindexed"} />
              <div className="video-info-bar">
                <div className="video-stats">
                  {video.creationDateTime && (
                    <span className="publish-time">
                      {moment(video.creationDateTime).format("LLL")}
                    </span>
                  )}
                </div>
                <div className="video-actions">
                  {/* <a download href={source} className="btn btn-transparent btn-rounded">
                    <DownloadIcon />
                  </a> */}
                </div>
              </div>

              <div className="my-8">
                <hr />
                <div className="video-profile-info">
                  {video.owner?.ownerAddress && (
                    <Link to={Routes.getProfileLink(video.owner.ownerAddress)}>
                      <div className="video-profile">
                        <Avatar image={video.owner.profileData?.avatar} address={video.owner.ownerAddress} />
                        <h3 className="profile-name">
                          {video.owner.profileData?.name || shortenEthAddr(video.owner.ownerAddress)}
                        </h3>
                      </div>
                    </Link>
                  )}
                </div>
                <hr />
              </div>

              <div className="video-description">
                {video.description ? (
                  <MarkdownPreview value={video.description} disableHeading={true} />
                ) : (
                  <p className="text-gray-500">
                    <em>This video doesn't have a description</em>
                  </p>
                )}
              </div>
            </div>
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
