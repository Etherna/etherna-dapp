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
 *  
 */

import React, { useEffect } from "react"
import { Redirect } from "react-router-dom"

import classes from "@styles/components/video/VideoUpdate.module.scss"
import { ReactComponent as NotFoundImage } from "@assets/backgrounds/404-illustration.svg"

import VideoEditor from "@components/video-editor/VideoEditor"
import { VideoEditorContextProvider } from "@context/video-editor-context"
import useSwarmVideo from "@hooks/useSwarmVideo"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import type { Video } from "@definitions/swarm-video"

type VideoUpdateProps = {
  reference: string
  routeState: Video | undefined
}

const VideoUpdate: React.FC<VideoUpdateProps> = ({ reference, routeState }) => {
  const { video, loadVideo } = useSwarmVideo({
    reference,
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
    <div className={classes.videoUpdate}>
      {!videoOnIndex && (
        <div className="table mx-auto mt-32">
          <NotFoundImage width={320} />
          <h2 className="text-center text-gray-800 mt-12">Video not found</h2>
        </div>
      )}
      {videoOnIndex && (
        <VideoEditorContextProvider reference={reference} videoData={video}>
          <VideoEditor />
        </VideoEditorContextProvider>
      )}
    </div>
  )
}

export default VideoUpdate
