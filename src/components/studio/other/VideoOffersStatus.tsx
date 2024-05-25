import React, { useState } from "react"

import { CurrencyDollarIcon } from "@heroicons/react/24/outline"

import VideoOffersModal from "@/components/modals/VideoSupportModal"
import { Badge, Spinner } from "@/components/ui/display"
import useExtensionsStore from "@/stores/extensions"

import type { VideoOffersStatus as VideoOffers } from "@/hooks/useVideoOffers"
import type { Video } from "@etherna/sdk-js"

type VideoOffersStatusProps = {
  className?: string
  video: Video
  offersStatus: VideoOffers | undefined
  isLoading?: boolean
  disabled?: boolean
  onOfferResources(): Promise<void>
  onUnofferResources(): Promise<void>
}

const VideoOffersStatus: React.FC<VideoOffersStatusProps> = ({
  className,
  video,
  offersStatus,
  isLoading,
  disabled,
  onOfferResources,
  onUnofferResources,
}) => {
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const [showOffersModal, setShowOffersModal] = useState(false)

  if (gatewayType === "bee" || !offersStatus) {
    return null
  }

  if (isLoading) {
    return <Spinner className="h-5 w-5" />
  }

  const status = offersStatus.userOffersStatus

  return (
    <div className={className}>
      <div className="grid auto-cols-min">
        <Badge
          color={
            status === "full"
              ? "success"
              : status === "partial"
                ? "indigo"
                : status === "sources"
                  ? "info"
                  : "muted"
          }
          small
          prefix={<CurrencyDollarIcon width={16} aria-hidden />}
          onClick={() => setShowOffersModal(true)}
          disabled={disabled}
        >
          {status === "none" && "No offers"}
          {status === "full" && "Fully offered"}
          {status === "sources" && "Video sources offered"}
          {status === "partial" && "Partially offered"}
        </Badge>
      </div>

      <VideoOffersModal
        show={showOffersModal}
        offersStatus={offersStatus}
        video={video}
        offerResources={onOfferResources}
        unofferResources={onUnofferResources}
        onClose={() => setShowOffersModal(false)}
      />
    </div>
  )
}

export default VideoOffersStatus
