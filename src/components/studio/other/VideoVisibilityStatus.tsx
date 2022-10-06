import React from "react"
import type { Video } from "@etherna/api-js"
import { urlHostname } from "@etherna/api-js/utils"

import { ChevronDownIcon } from "@heroicons/react/24/solid"

import { Button } from "@/components/ui/actions"
import { Badge, Spinner } from "@/components/ui/display"
import type { VisibilityStatus } from "@/hooks/useUserVideos"

type VideoVisibilityStatusProps = {
  className?: string
  video: Video
  visibility: VisibilityStatus[]
  isLoading?: boolean
}

const VideoVisibilityStatus: React.FC<VideoVisibilityStatusProps> = ({
  className,
  visibility,
  isLoading,
}) => {
  if (isLoading) {
    return <Spinner className="h-5 w-5" />
  }

  if (!visibility) return null

  return (
    <div className={className}>
      <Button
        className="rounded p-1 hover:bg-gray-500/30"
        suffix={<ChevronDownIcon width={14} />}
        aspect="text"
        color="inverted"
      >
        <div className="grid auto-cols-min grid-flow-row-dense grid-cols-2 gap-1">
          {visibility.map(sourceVisibility => (
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
              <span>
                {sourceVisibility.sourceType === "playlist"
                  ? "Channel"
                  : urlHostname(sourceVisibility.sourceIdentifier)}
              </span>
              <span>: </span>
              <span>{sourceVisibility.status}</span>
            </Badge>
          ))}
        </div>
      </Button>
    </div>
  )
}

export default VideoVisibilityStatus
