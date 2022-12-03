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
import React, { useCallback, useMemo, useState } from "react"

import ResourcesSupportStatus from "@/components/common/ResourcesSupportStatus"
import { Button, Modal } from "@/components/ui/actions"
import { SegmentedControl } from "@/components/ui/inputs"
import useErrorMessage from "@/hooks/useErrorMessage"
import useUserStore from "@/stores/user"

import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import type { VideoPinningStatus } from "@/hooks/useVideoPinning"
import type { Video } from "@etherna/api-js"

type VideoSupportModalProps = {
  show: boolean
  offersStatus: VideoOffersStatus | undefined
  pinningStatus?: VideoPinningStatus | undefined
  video: Video | undefined
  onClose(): void
  offerResources(): Promise<void>
  unofferResources(): Promise<void>
  pinResources?(): Promise<void>
  unpinResources?(): Promise<void>
}

const VideoSupportModal: React.FC<VideoSupportModalProps> = ({
  show,
  video,
  offersStatus,
  pinningStatus,
  offerResources,
  unofferResources,
  pinResources,
  unpinResources,
  onClose,
}) => {
  const address = useUserStore(state => state.address)
  const [isAddingOffers, setIsAddingOffers] = useState(false)
  const [isRemovingOffers, setIsRemovingOffers] = useState(false)
  const [supportTab, setSupportTab] = useState("offers")
  const { showError } = useErrorMessage()

  const userSupportCount = useMemo(() => {
    if (supportTab === "offers") {
      return offersStatus?.userOfferedResourses.length ?? 0
    } else {
      return pinningStatus?.userPinnedResourses.length ?? 0
    }
  }, [offersStatus, pinningStatus, supportTab])

  const userUnsupportCount = useMemo(() => {
    if (supportTab === "offers") {
      return offersStatus?.userUnOfferedResourses.length ?? 0
    } else {
      return pinningStatus?.userUnPinnedResourses.length ?? 0
    }
  }, [offersStatus, pinningStatus, supportTab])

  const supportAllResources = useCallback(async () => {
    setIsAddingOffers(true)
    try {
      if (supportTab === "offers") {
        await offerResources()
      } else {
        await pinResources?.()
      }
    } catch (error: any) {
      showError(
        supportTab === "offers" ? "Cannot offer resources" : "Cannot pin resources",
        error.message
      )
    }
    setIsAddingOffers(false)
  }, [offerResources, supportTab, pinResources, showError])

  const unsupportAllResources = useCallback(async () => {
    setIsRemovingOffers(true)
    try {
      if (supportTab === "offers") {
        await unofferResources()
      } else {
        await unpinResources?.()
      }
    } catch (error: any) {
      showError(
        supportTab === "offers" ? "Cannot cancel offers" : "Cannot cancel pins",
        error.message
      )
    }
    setIsRemovingOffers(false)
  }, [supportTab, showError, unofferResources, unpinResources])

  const isSupportedByUser = useCallback(
    (reference: string) => {
      return supportTab === "offers"
        ? offersStatus?.globalOffers
            .find(status => status.reference === reference)
            ?.offeredBy.includes(address ?? "") ?? false
        : pinningStatus?.globalPinning
            .find(status => status.reference === reference)
            ?.pinnedBy.includes(address ?? "") ?? false
    },
    [address, supportTab, offersStatus, pinningStatus]
  )

  const isInProgress = useCallback(
    (reference: string) => {
      if (supportTab === "offers") return false

      return (
        pinningStatus?.globalPinning.find(status => status.reference === reference)?.inProgress ??
        false
      )
    },
    [supportTab, pinningStatus]
  )

  const globalSupportCount = useCallback(
    (reference: string) => {
      return supportTab === "offers"
        ? offersStatus?.globalOffers.find(status => status.reference === reference)?.offeredBy
            .length ?? 0
        : pinningStatus?.globalPinning.find(status => status.reference === reference)?.pinnedBy
            .length ?? 0
    },
    [supportTab, offersStatus, pinningStatus]
  )

  return (
    <Modal
      show={show}
      showCloseButton={false}
      showCancelButton={false}
      title="Video support"
      footerButtons={
        <>
          <Button className="sm:ml-auto" color="muted" onClick={onClose}>
            OK
          </Button>
          {offersStatus && (
            <>
              {userSupportCount > 0 && (
                <Button color="error" onClick={unsupportAllResources} loading={isRemovingOffers}>
                  Remove your {supportTab === "offers" ? "offers" : "pins"}
                </Button>
              )}
              {userUnsupportCount > 0 && (
                <Button onClick={supportAllResources} loading={isAddingOffers}>
                  {userSupportCount > 0
                    ? `${supportTab === "offers" ? "Offer" : "Pin"} missing resources`
                    : `${supportTab === "offers" ? "Offer" : "Pin"} resources`}
                </Button>
              )}
            </>
          )}
        </>
      }
      large
    >
      {pinningStatus && (
        <SegmentedControl
          defaultValue="user"
          value={supportTab}
          entries={[
            {
              label: "Offers",
              value: "offers",
              tip: "All the resources offered by the community (already payed)",
            },
            {
              label: "Pinning",
              value: "pinning",
              tip: "All the resources pinned by the community (kept alive)",
            },
          ]}
          onChange={setSupportTab}
        />
      )}

      <ResourcesSupportStatus
        video={video}
        isSupportedByUser={isSupportedByUser}
        isInProgress={isInProgress}
        globalSupportCount={globalSupportCount}
      />
    </Modal>
  )
}

export default VideoSupportModal
