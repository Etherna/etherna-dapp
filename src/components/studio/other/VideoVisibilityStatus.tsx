import React, { useCallback, useState } from "react"
import { urlHostname } from "@etherna/sdk-js/utils"
import { Portal } from "@headlessui/react"

import { ChevronDownIcon } from "@heroicons/react/24/solid"

import { Button, Dropdown } from "@/components/ui/actions"
import { Badge, Spinner } from "@/components/ui/display"
import { Toggle } from "@/components/ui/inputs"

import type { VideosSource } from "@/hooks/useUserVideos"
import type { VisibilityStatus } from "@/hooks/useUserVideosVisibility"
import type useUserVideosVisibility from "@/hooks/useUserVideosVisibility"
import type { VideoWithIndexes } from "@/types/video"

type VideoVisibilityStatusProps = {
  className?: string
  video: VideoWithIndexes
  visibility: VisibilityStatus[]
  isLoading?: boolean
  disabled?: boolean
  toggleVisibilityCallback: ReturnType<typeof useUserVideosVisibility>["toggleVideosVisibility"]
}

const VideoVisibilityStatus: React.FC<VideoVisibilityStatusProps> = ({
  className,
  visibility,
  isLoading,
  video,
  disabled,
  toggleVisibilityCallback,
}) => {
  const [isToggling, setIsToggling] = useState(false)
  const renderBadge = useCallback((sourceVisibility: VisibilityStatus, withLabel: boolean) => {
    return (
      <Badge
        color={
          sourceVisibility.status === "public"
            ? "success"
            : sourceVisibility.status === "processing"
            ? "info"
            : "muted"
        }
        variant="outline"
        small
        key={sourceVisibility.sourceIdentifier}
      >
        {withLabel && (
          <>
            <span>
              {sourceVisibility.sourceType === "playlist"
                ? "Channel"
                : urlHostname(sourceVisibility.sourceIdentifier)}
            </span>
            <span>: </span>
          </>
        )}
        <span>{sourceVisibility.status}</span>
      </Badge>
    )
  }, [])

  const toggleVisibility = useCallback(
    async (currentStatus: VisibilityStatus) => {
      setIsToggling(true)
      const nextStatus = currentStatus.status === "public" ? "unpublished" : "published"
      const source: VideosSource =
        currentStatus.sourceType === "playlist"
          ? { type: "channel" }
          : { type: "index", indexUrl: currentStatus.sourceIdentifier }
      await toggleVisibilityCallback([video], source, nextStatus)
      setIsToggling(false)
    },
    [toggleVisibilityCallback, video]
  )

  if (isLoading) {
    return <Spinner className="h-5 w-5" />
  }

  if (!visibility) return null

  return (
    <Dropdown className={className}>
      <Dropdown.Toggle disabled={disabled}>
        <Button
          as="div"
          className={!disabled ? "rounded p-1 hover:bg-gray-500/30" : ""}
          suffix={<ChevronDownIcon width={14} />}
          aspect="text"
          color="inverted"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {visibility.map(sourceVisibility => renderBadge(sourceVisibility, true))}
          </div>
        </Button>
      </Dropdown.Toggle>

      <Portal>
        <Dropdown.Menu className="px-6 text-sm">
          <ul className="flex flex-col space-y-4 divide-y divide-gray-500 pb-4">
            {visibility.map((sourceVisibility, i) => (
              <li className="flex pt-3" key={i}>
                <div className="flex flex-col items-start">
                  <span>
                    {sourceVisibility.sourceType === "index" && "Index"}
                    {sourceVisibility.sourceType === "playlist" && "Public Channel"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {sourceVisibility.sourceType === "index" && sourceVisibility.sourceIdentifier}
                    {sourceVisibility.sourceType === "playlist" && "Decentrazlied feed"}
                  </span>
                  <span className="mt-2">{renderBadge(sourceVisibility, false)}</span>
                  {sourceVisibility.errors?.length && (
                    <ul className="text-xs leading-none text-red-500">
                      {sourceVisibility.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {isToggling ? (
                  <Spinner size={16} />
                ) : (
                  <Toggle
                    className="ml-auto"
                    checked={
                      sourceVisibility.status === "public" ||
                      sourceVisibility.status === "processing"
                    }
                    onChange={() => toggleVisibility(sourceVisibility)}
                  />
                )}
              </li>
            ))}
          </ul>
        </Dropdown.Menu>
      </Portal>
    </Dropdown>
  )
}

export default VideoVisibilityStatus
