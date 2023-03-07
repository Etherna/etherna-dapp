import React from "react"

import { Button } from "@/components/ui/actions"
import { Card, ProgressBar } from "@/components/ui/display"
import useVideoEditorResume from "@/hooks/useVideoEditorResume"
import { videoProcessingController } from "@/hooks/useVideoProcessing"
import useVideoEditorStore from "@/stores/video-editor"
import classNames from "@/utils/classnames"

import type { PropsWithChildren } from "react"

type VideoProgressCardProps = {
  className?: string
  disabled?: boolean
}

type ProgressCardProps = PropsWithChildren<{
  title: string
  progress: number
  indeterminate?: boolean
  status: "progress" | "progress-rainbow" | "done" | "error" | undefined
  message?: string
}>

const VideoProgressCard: React.FC<VideoProgressCardProps> = ({ className, disabled }) => {
  const encoding = useVideoEditorStore(state => state.encoding)
  const batch = useVideoEditorStore(state => state.batch)
  const upload = useVideoEditorStore(state => state.upload)
  const { resumeBatchLoading, resumeUpload } = useVideoEditorResume()

  return (
    <div className={classNames("[&_h4]:mb-2 [&_h4]:text-sm [&_h4]:font-semibold", className)}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <ProgressCard
          title="Encoding"
          indeterminate={encoding.status === "loading"}
          progress={encoding.status === "error" ? 100 : encoding.progress ?? 0}
          status={
            encoding.status === "progress"
              ? "progress-rainbow"
              : encoding.status === "loading"
              ? "progress"
              : encoding.status === "done"
              ? "done"
              : encoding.status === "error"
              ? "error"
              : undefined
          }
        />
        <ProgressCard
          title="Postage batch"
          progress={batch.batchId ? 100 : 0}
          indeterminate={["creating", "updating", "fetching", "propagation"].includes(
            batch.status!
          )}
          status={
            batch.status === undefined && batch.batchId
              ? "done"
              : batch.status === "not-found" || batch.status === "rejected"
              ? "error"
              : ["creating", "updating", "fetching", "propagation"].includes(batch.status!)
              ? "progress"
              : undefined
          }
          message={
            batch.status === "creating"
              ? "Creating postage batch"
              : batch.status === "updating"
              ? "Updating batch"
              : batch.status === "fetching"
              ? "Loading batch"
              : batch.status === "propagation"
              ? "Waiting for batch propagation"
              : undefined
          }
        >
          {(batch.status === "not-found" || batch.status === "rejected") && (
            <Button color="inverted" small onClick={resumeBatchLoading}>
              {batch.status === "not-found" && "Create new batch"}
              {batch.status === "rejected" && !batch.batchId && "Create new batch"}
              {batch.status === "rejected" && batch.batchId && "Update batch"}
            </Button>
          )}
        </ProgressCard>
        <ProgressCard
          title="Upload"
          progress={upload.status === "error" && !upload.progress ? 100 : upload.progress ?? 0}
          status={
            upload.status === "progress"
              ? "progress"
              : upload.status === "done"
              ? "done"
              : upload.status === "error"
              ? "error"
              : undefined
          }
        >
          {upload.status === "error" && (
            <Button color="inverted" small onClick={resumeUpload}>
              Try resuming upload
            </Button>
          )}
        </ProgressCard>
      </div>
    </div>
  )
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  children,
  title,
  progress,
  indeterminate,
  status,
  message,
}) => {
  return (
    <Card className="py-2">
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <ProgressBar
        color={
          status === "progress"
            ? "primary"
            : status === "progress-rainbow"
            ? "rainbow"
            : status === "done"
            ? "success"
            : status === "error"
            ? "error"
            : "muted"
        }
        progress={progress}
        indeterminate={indeterminate}
        height={6}
      />

      {message && <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{message}</p>}

      {children && <div className="mt-2">{children}</div>}
    </Card>
  )
}

export default VideoProgressCard
