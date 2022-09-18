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

import React, { useCallback, useState } from "react"
import Tippy from "@tippyjs/react"
import classNames from "classnames"

import SwarmResourcesIO from "@/classes/SwarmResources"
import { Button, Modal } from "@/components/ui/actions"
import { SegmentedControl } from "@/components/ui/inputs"
import { showError } from "@/state/actions/modals"
import useSelector from "@/state/useSelector"
import type { Video, VideoOffersStatus } from "@/types/swarm-video"

type VideoOffersModalProps = {
  show: boolean
  offersStatus: VideoOffersStatus | undefined
  video: Video | undefined
  onClose(): void
  offerResources(): Promise<void>
  unofferResources(): Promise<void>
}

const VideoOffersModal: React.FC<VideoOffersModalProps> = ({
  show,
  video,
  offersStatus,
  offerResources,
  unofferResources,
  onClose,
}) => {
  const { address } = useSelector(state => state.user)

  const [isAddingOffers, setIsAddingOffers] = useState(false)
  const [isRemovingOffers, setIsRemovingOffers] = useState(false)
  const [offersTab, setOffersTab] = useState("user")

  const offerAllResources = useCallback(async () => {
    setIsAddingOffers(true)
    try {
      await offerResources()
    } catch (error: any) {
      showError("Cannot offer resources", error.message)
    }
    setIsAddingOffers(false)
  }, [offerResources])

  const unofferAllResources = useCallback(async () => {
    setIsRemovingOffers(true)
    try {
      await unofferResources()
    } catch (error: any) {
      showError("Cannot cancel offers", error.message)
    }
    setIsRemovingOffers(false)
  }, [unofferResources])

  const isActiveResource = useCallback(
    (resourceStatus: VideoOffersStatus["globalOffers"][number]) => {
      return offersTab === "user"
        ? address && resourceStatus.offeredBy.includes(address)
        : offersTab === "global" && resourceStatus.offeredBy.length > 0
    },
    [address, offersTab]
  )

  return (
    <Modal
      show={show}
      showCloseButton={false}
      showCancelButton={false}
      title="Video offers"
      footerButtons={
        <>
          <Button className="sm:ml-auto" color="muted" onClick={onClose}>
            OK
          </Button>
          {offersStatus && (
            <>
              {offersStatus.userOfferedResourses.length > 0 && (
                <Button color="error" onClick={unofferAllResources} loading={isRemovingOffers}>
                  Remove your offers
                </Button>
              )}
              {offersStatus.userUnOfferedResourses.length > 0 && (
                <Button onClick={offerAllResources} loading={isAddingOffers}>
                  {offersStatus.userOfferedResourses.length > 0
                    ? "Offer missing resources"
                    : "Offer resources"}
                </Button>
              )}
            </>
          )}
        </>
      }
      large
    >
      <SegmentedControl
        defaultValue="user"
        value={offersTab}
        entries={[
          {
            label: "Yours",
            value: "user",
            tip: "Show all resources offered by you",
          },
          {
            label: "Global",
            value: "global",
            tip: "Show all resources offers from any users",
          },
        ]}
        onChange={setOffersTab}
      />

      {video && offersStatus && (
        <table className="mt-4 w-full">
          <thead>
            <tr>
              <th></th>
              <th style={{ width: "100px" }}></th>
            </tr>
          </thead>
          <tbody>
            {offersStatus.globalOffers.map(resourceStatus => (
              <tr key={resourceStatus.reference}>
                <th>{SwarmResourcesIO.getVideoReferenceLabel(video, resourceStatus.reference)}</th>
                <td>
                  <Tippy
                    content={
                      offersTab === "user"
                        ? resourceStatus.offeredBy.includes(address ?? "")
                          ? "Offered by you"
                          : "You are not offering this resource"
                        : `This resource is offered by ${resourceStatus.offeredBy.length} users`
                    }
                  >
                    <span
                      className={classNames(
                        "relative inline-flex h-4 min-w-[1rem] rounded-full text-xs font-semibold",
                        {
                          "bg-gray-200 text-gray-600 dark:bg-gray-400 dark:text-gray-800":
                            !isActiveResource(resourceStatus),
                          "bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white":
                            isActiveResource(resourceStatus),
                          "w-4": offersTab === "user",
                          "px-1": offersTab === "global",
                        }
                      )}
                    >
                      {offersTab === "global" && (
                        <>
                          <span className="sr-only">{resourceStatus.offeredBy.length}</span>
                          <span className="absolute-center">{resourceStatus.offeredBy.length}</span>
                        </>
                      )}
                    </span>
                  </Tippy>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  )
}

export default VideoOffersModal
