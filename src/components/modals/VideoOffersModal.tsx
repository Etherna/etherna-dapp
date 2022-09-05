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
import React, { useState } from "react"
import Tippy from "@tippyjs/react"
import classNames from "classnames"

import SwarmResourcesIO from "@/classes/SwarmResources"
import { Button, Modal } from "@/components/ui/actions"
import { SegmentedControl } from "@/components/ui/inputs"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"
import { showError } from "@/state/actions/modals"
import useSelector from "@/state/useSelector"

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

  const offerAllResources = async () => {
    setIsAddingOffers(true)
    try {
      await offerResources()
    } catch (error: any) {
      showError("Cannot offer resources", error.message)
    }
    setIsAddingOffers(false)
  }

  const unofferAllResources = async () => {
    setIsRemovingOffers(true)
    try {
      await unofferResources()
    } catch (error: any) {
      showError("Cannot cancel offers", error.message)
    }
    setIsRemovingOffers(false)
  }

  return (
    <Modal
      show={show}
      showCloseButton={false}
      showCancelButton={false}
      title="Video offers"
      footerButtons={
        <>
          <Button color="muted" onClick={onClose}>
            OK
          </Button>
          {offersStatus && (
            <div className="sm:mr-auto sm:space-x-2">
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
            </div>
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
        <table className="w-full mt-4">
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
                        "px-1 w-4 h-4 inline-flex rounded-full text-xs font-semibold",
                        "bg-gray-200 dark:bg-gray-400 text-gray-600 dark:text-gray-800",
                        {
                          "bg-emerald-500 dark:bg-emerald-500 text-white dark:text-white":
                            offersTab === "user"
                              ? address && resourceStatus.offeredBy.includes(address)
                              : offersTab === "global" && resourceStatus.offeredBy.length > 0,
                          "px-2 w-auto": offersTab === "global",
                        }
                      )}
                    >
                      {offersTab === "global" ? resourceStatus.offeredBy.length : ""}
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
