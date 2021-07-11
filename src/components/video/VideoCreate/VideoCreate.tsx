import React from "react"

import "./video-create.scss"

import VideoEditor from "@components/media/VideoEditor"
import Avatar from "@components/user/Avatar"
import { VideoEditorContextProvider } from "@context/video-editor-context"
import useSelector from "@state/useSelector"

const Uploader = () => {
  const { name, avatar } = useSelector(state => state.profile)
  const { address } = useSelector(state => state.user)

  return (
    <div className="uploader">
      <div className="row">
        <h1>Upload a video</h1>
      </div>
      <div className="row mb-6">
        <div className="flex items-center">
          <Avatar image={avatar} address={address} />
          <h3 className="mb-0 ml-1">{name}</h3>
        </div>
      </div>

      <VideoEditorContextProvider reference={undefined}>
        <VideoEditor />
      </VideoEditorContextProvider>
    </div>
  )
}

export default Uploader
