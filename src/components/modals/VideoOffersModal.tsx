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
import classNames from "classnames"
import Tippy from "@tippyjs/react"

import classes from "@styles/components/modals/VideoOffersModal.module.scss"

import Modal from "@common/Modal"
import Button from "@common/Button"
import SegmentedControl from "@common/SegmentedControl"
import SwarmResourcesIO from "@classes/SwarmResources"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import type { Video, VideoOffersStatus } from "@definitions/swarm-video"

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
          <Button modifier="secondary" onClick={onClose}>
            OK
          </Button>
          {offersStatus && (
            <div className="sm:mr-auto sm:space-x-2">
              {offersStatus.userOfferedResourses.length > 0 && (
                <Button modifier="danger" onClick={unofferAllResources} loading={isRemovingOffers}>
                  Remove your offers
                </Button>
              )}
              {offersStatus.userUnOfferedResourses.length > 0 && (
                <Button modifier="primary" onClick={offerAllResources} loading={isAddingOffers}>
                  {offersStatus.userOfferedResourses.length > 0 ? "Offer missing resources" : "Offer resources"}
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
        entries={[{
          label: "Yours",
          value: "user",
          tip: "Show all resources offered by you"
        }, {
          label: "Global",
          value: "global",
          tip: "Show all resources offers from any users"
        }]}
        onChange={setOffersTab}
      />

      {(video && offersStatus) && (
        <table className={classes.offersModalTable}>
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
                      className={classNames(classes.offersModalStatus, {
                        [classes.offered]: offersTab === "user"
                          ? address && resourceStatus.offeredBy.includes(address)
                          : offersTab === "global" && resourceStatus.offeredBy.length > 0,
                        [classes.counter]: offersTab === "global",
                      })}
                    >
                      {
                        offersTab === "global"
                          ? resourceStatus.offeredBy.length
                          : ""
                      }
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
