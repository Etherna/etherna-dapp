import React, { useCallback, useRef, useState } from "react"

import { ArrowUpTrayIcon, CloudArrowDownIcon, XMarkIcon } from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/actions"
import { Alert, Card, ProgressBar } from "@/components/ui/display"
import useConfirmation from "@/hooks/useConfirmation"
import useErrorMessage from "@/hooks/useErrorMessage"
import useClientsStore from "@/stores/clients"
import useVideoEditorStore from "@/stores/video-editor"

import type { VideoSourceRaw } from "@etherna/sdk-js"

type EncodingUpgradeCardProps = {
  className?: string
}

const EncodingUpgradeCard: React.FC<EncodingUpgradeCardProps> = ({ className }) => {
  const reference = useVideoEditorStore(state => state.reference)
  const initialSources = useVideoEditorStore(state => state.initialSources)
  const beeClient = useClientsStore(state => state.beeClient)
  const [downloadProgress, setDownloadProgress] = useState<number>()
  const abortController = useRef<AbortController>()
  const setInputFile = useVideoEditorStore(state => state.setInputFile)
  const { waitConfirmation } = useConfirmation()
  const { showError } = useErrorMessage()

  const downloadFromNetwork = useCallback(async () => {
    const confirm = await waitConfirmation(
      "Confirm download from network",
      "Are you sure? This will use your credit",
      "Proceed"
    )

    if (!confirm) return

    const sourceToDownload = initialSources?.sort(
      (a, b) =>
        (b.type === "mp4" ? parseInt(b.quality) : 0) - (a.type === "mp4" ? parseInt(a.quality) : 0)
    )[0] as (VideoSourceRaw & { type: "mp4" }) | undefined

    if (!sourceToDownload || (!sourceToDownload.reference && !sourceToDownload.path))
      return showError("No source to download", "This video has no valid downloadable sources")

    abortController.current = new AbortController()

    const resp = await beeClient.bzz.downloadPath(
      sourceToDownload.reference ? sourceToDownload.reference : reference!,
      sourceToDownload.path ? sourceToDownload.path : undefined,
      {
        signal: abortController.current.signal,
        onDownloadProgress: p => {
          setDownloadProgress(p)
        },
      }
    )
    setInputFile(new Blob([resp.data], { type: "video/mp4" }) as File)
    setDownloadProgress(undefined)
  }, [beeClient, initialSources, reference, setInputFile, showError, waitConfirmation])

  const onFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setInputFile(file)
      }

      e.target.value = ""
    },
    [setInputFile]
  )

  const cancelDownload = useCallback(() => {
    abortController.current?.abort()
    setDownloadProgress(undefined)
  }, [])

  return (
    <Card className={className}>
      <Alert title="Upgrade required" color="warning">
        This video requires encoding. Please select this video again to begin the upgrade process.
      </Alert>

      <div className="mt-6">
        {typeof downloadProgress === "number" ? (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-3">
              <ProgressBar progress={downloadProgress} />
              <Button color="inverted" aspect="fill" rounded small onClick={cancelDownload}>
                <XMarkIcon width={16} strokeWidth={2} />
              </Button>
            </div>
            <small>Downloading the original source from the network...</small>
          </div>
        ) : (
          <div className="">
            <p className="mb-2">Choose an option:</p>
            <div className="grid grid-flow-row gap-4 sm:grid-flow-col">
              <Button color="inverted" aspect="outline" onClick={downloadFromNetwork}>
                <CloudArrowDownIcon className="mr-2" width={18} strokeWidth={2} />
                Download from network
              </Button>
              <label htmlFor="video-select">
                <input type="file" id="video-select" className="hidden" onChange={onFileSelected} />
                <Button
                  as="div"
                  className="w-full cursor-pointer"
                  color="inverted"
                  aspect="outline"
                >
                  <ArrowUpTrayIcon className="mr-2" width={18} strokeWidth={2} />
                  Select from your local machine
                </Button>
              </label>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default EncodingUpgradeCard
