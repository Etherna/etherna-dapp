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

import React, { useCallback, useEffect, useMemo, useRef } from "react"

import { Button, Modal } from "@/components/ui/actions"
import { Badge, ProgressBar, Spinner } from "@/components/ui/display"
import useConfirmation from "@/hooks/useConfirmation"
import useErrorMessage from "@/hooks/useErrorMessage"

import type { MigrationStatus } from "@/hooks/useBulkMigrations"
import type { Video } from "@etherna/sdk-js"

type VideoMigrationModalProps = {
  show: boolean
  videos: Video[]
  isMigrating: boolean
  migrationStatus: Record<string, MigrationStatus>
  migrateHandler(signal: AbortSignal): Promise<void>
  onCancel?(): void
  onMigrationCompleted?(): void
}

const VideoMigrationModal: React.FC<VideoMigrationModalProps> = ({
  show,
  videos,
  isMigrating,
  migrationStatus,
  migrateHandler,
  onCancel,
  onMigrationCompleted,
}) => {
  const { showError } = useErrorMessage()
  const { waitConfirmation } = useConfirmation()
  const abortController = useRef<AbortController>()

  const isDone = useMemo(() => {
    const values = Object.values(migrationStatus)
    return (
      values.length > 0 &&
      values.every(status => status.status === "done" || status.status === "error")
    )
  }, [migrationStatus])

  useEffect(() => {
    if (!isMigrating && isDone) {
      onMigrationCompleted?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMigrating, isDone])

  const handleCancel = useCallback(async () => {
    if (!isMigrating) {
      onCancel?.()
      return
    }

    const confirm = await waitConfirmation(
      "Cancel upgrade?",
      "This might result in some inconsistency with previus offers and pinning. Continue?"
    )

    if (confirm) {
      abortController.current?.abort()
      onCancel?.()
    }
  }, [isMigrating, onCancel, waitConfirmation])

  const handleMigration = useCallback(async () => {
    try {
      abortController.current = new AbortController()
      await migrateHandler(abortController.current.signal)
    } catch (error: any) {
      console.error(error)

      onCancel?.()
      showError("Cannot migrate videos", error.message)
    }
  }, [migrateHandler, onCancel, showError])

  return (
    <Modal
      show={show}
      title={
        isDone
          ? "Upgrade completed!"
          : `Upgrade ${videos.length > 1 ? `${videos.length} videos` : "this video"}?`
      }
      footerButtons={
        <>
          {!isDone && (
            <Button color="primary" loading={isMigrating} onClick={handleMigration}>
              Yes, Upgrade
            </Button>
          )}
          <Button color="muted" onClick={handleCancel}>
            {isDone ? "Close" : "Cancel"}
          </Button>
        </>
      }
      onClose={onCancel}
      large
    >
      <div className="overflow-y-auto">
        {(isMigrating || isDone) && (
          <table className="w-full">
            {videos.map(video => (
              <tr key={video.reference}>
                <td>
                  <span className="line-clamp-1 text-ellipsis">{video.preview.title}</span>
                </td>
                <td className="w-px whitespace-nowrap pl-4">
                  {migrationStatus[video.reference]?.status === "downloading" && (
                    <span>Downloading infos...</span>
                  )}
                  {migrationStatus[video.reference]?.status === "saving" && <span>Saving...</span>}
                  {migrationStatus[video.reference]?.status === "batchId" && (
                    <span>Creating batch id...</span>
                  )}
                </td>
                <td className="w-px whitespace-nowrap pl-4">
                  {migrationStatus[video.reference]?.status === "error" ? (
                    <Badge color="error" small>
                      error
                    </Badge>
                  ) : migrationStatus[video.reference]?.status === "done" ? (
                    <Badge color="success" small>
                      saved
                    </Badge>
                  ) : migrationStatus[video.reference]?.status === "downloading" ? (
                    <ProgressBar
                      className="w-10"
                      progress={migrationStatus[video.reference]?.downloadProgress ?? 0}
                    />
                  ) : (
                    <Spinner size={16} />
                  )}
                </td>
              </tr>
            ))}
          </table>
        )}
      </div>
    </Modal>
  )
}

export default VideoMigrationModal
