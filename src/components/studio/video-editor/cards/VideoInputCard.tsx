import React, { useCallback } from "react"

import FileDrag from "@/components/media/FileDrag"
import { Alert, Card } from "@/components/ui/display"
import useErrorMessage from "@/hooks/useErrorMessage"
import useVideoEditorStore from "@/stores/video-editor"

type VideoInputCardProps = {
  disabled?: boolean
}

const VideoInputCard: React.FC<VideoInputCardProps> = ({ disabled }) => {
  const setInputFile = useVideoEditorStore(state => state.setInputFile)
  const { showError } = useErrorMessage()

  const canSelectFile = useCallback(
    async (file: File) => {
      if (!file) {
        showError("Error", "The selected file is not supported")
        return false
      }
      return true
    },
    [showError]
  )

  return (
    <Card>
      {typeof window.SharedArrayBuffer === "undefined" ? (
        <Alert title="Encoding not supported" color="error">
          Your browser does not support the required features to encode the video. Please use a
          different browser.
        </Alert>
      ) : (
        <FileDrag
          id="video-input-drag"
          label="Drag the video file here"
          mimeTypes={"video/*"}
          canSelectFile={canSelectFile}
          onSelectFile={setInputFile}
          disabled={disabled}
          confirmChildren={({ name }) => (
            <div className="flex flex-col items-start space-y-2">
              <div className="rounded bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-2 py-0.5 text-sm font-semibold text-white">
                Experimental encoding
              </div>
              <p>
                You selected <span className="text-black dark:text-white">{name}</span>.{" "}
              </p>
              <p>This video is going to get encoded and then uploaded.</p>
              <p>
                The encoding process might take several minutes. Are you sure you want to continue?
              </p>
            </div>
          )}
        />
      )}
    </Card>
  )
}

export default VideoInputCard
