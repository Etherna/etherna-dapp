import React, { useCallback } from "react"

import { Spinner } from "@/components/ui/display"
import { Toggle } from "@/components/ui/inputs"
import useErrorMessage from "@/hooks/useErrorMessage"
import { cn } from "@/utils/classnames"

import type useUserVideosPinning from "@/hooks/useUserVideosPinning"
import type { VideoWithIndexes } from "@/types/video"
import type { SwarmResourcePinStatus } from "@etherna/sdk-js/handlers/pinning/types"

type VideoPinningStatusProps = {
  className?: string
  video: VideoWithIndexes
  isLoading?: boolean
  pinStatus: SwarmResourcePinStatus | undefined
  disabled?: boolean
  togglePinningCallback: ReturnType<typeof useUserVideosPinning>["togglePinning"]
}

const VideoPinningStatus: React.FC<VideoPinningStatusProps> = ({
  className,
  video,
  isLoading,
  pinStatus,
  disabled,
  togglePinningCallback,
}) => {
  const { showError } = useErrorMessage()

  const togglePinning = useCallback(
    (pin: boolean) => {
      togglePinningCallback(video, pin).catch(error => {
        console.error(error)
        showError("Coudn't change video pinning status")
      })
    },
    [showError, togglePinningCallback, video]
  )

  const isPinning = pinStatus?.isPinningInProgress

  return (
    <div className={cn("flex flex-wrap items-center", className)}>
      {isLoading ? (
        <Spinner size={20} />
      ) : (
        <>
          {!isPinning && (
            <Toggle
              className="mr-1"
              size="xs"
              checked={pinStatus?.isPinned === true}
              onChange={on => togglePinning(on)}
              disabled={disabled}
            />
          )}
          {isPinning ? (
            <span className="text-xs">Pinning...</span>
          ) : (
            <span className="text-xs">{pinStatus?.isPinned ? "Pinned" : "Not pinned"}</span>
          )}
        </>
      )}
    </div>
  )
}

export default VideoPinningStatus
