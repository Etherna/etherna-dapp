import "./video-create.scss"

import VideoEditor from "@components/media/VideoEditor"
import VideoEditorContextWrapper from "@components/media/VideoEditor/context/ContextWrapper"
import Avatar from "@components/user/Avatar"
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

      <VideoEditorContextWrapper reference={undefined}>
        <VideoEditor />
      </VideoEditorContextWrapper>
    </div>
  )
}

export default Uploader
