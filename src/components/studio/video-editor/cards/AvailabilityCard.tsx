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
import React, { useCallback, useEffect, useRef } from "react"
import { EthernaPinningHandler } from "@etherna/api-js/handlers"

import FieldDescription from "@/components/common/FieldDescription"
import { Card, FormGroup, Spinner } from "@/components/ui/display"
import { Toggle } from "@/components/ui/inputs"
import useVideoOffers from "@/hooks/useVideoOffers"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useVideoEditorStore from "@/stores/video-editor"

type AvailabilityCardProps = {
  disabled?: boolean
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ disabled }) => {
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const isBeeInstance = useExtensionsStore(state => state.currentGatewayType === "bee")
  const reference = useVideoEditorStore(state => state.reference)
  const video = useVideoEditorStore(state => state.video)
  const offerResources = useVideoEditorStore(state => state.offerResources)
  const pinContent = useVideoEditorStore(state => state.pinContent)
  const toggleOfferResources = useVideoEditorStore(state => state.toggleOfferResources)
  const togglePinContent = useVideoEditorStore(state => state.togglePinContent)
  const { videoOffersStatus } = useVideoOffers(video, {
    reference,
  })
  const abortController = useRef<AbortController>()

  useEffect(() => {
    if (!videoOffersStatus) return
    toggleOfferResources(videoOffersStatus.userOffersStatus !== "none")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOffersStatus])

  const togglePinning = useCallback(
    (enabled: boolean) => {
      // we don't await before toggling as we use optimistic UI

      togglePinContent(enabled)

      if (abortController.current) {
        abortController.current.abort()
      }
      abortController.current = new AbortController()

      const handler = new EthernaPinningHandler([video], {
        client: isBeeInstance ? beeClient : gatewayClient,
      })

      if (enabled) {
        handler
          .pinResources({
            signal: abortController.current.signal,
          })
          .catch(() => {
            togglePinContent(!enabled)
          })
      } else {
        handler
          .unpinResources({
            signal: abortController.current.signal,
          })
          .catch(() => {
            togglePinContent(!enabled)
          })
      }
    },
    [beeClient, gatewayClient, isBeeInstance, video, togglePinContent]
  )

  return (
    <Card title="Video availability">
      <FormGroup>
        {videoOffersStatus === undefined && reference ? (
          <Spinner />
        ) : (
          <Toggle
            label="Offer resources"
            checked={offerResources}
            onChange={on => toggleOfferResources(on)}
            disabled={disabled}
          />
        )}
        <FieldDescription className="mt-1">
          By offering the video resources you make the video available for everyone for free at your
          own cost.
        </FieldDescription>
      </FormGroup>

      <FormGroup>
        <Toggle
          label="Pin video"
          checked={pinContent ?? false}
          onChange={on => togglePinning(on)}
          disabled={disabled}
        />
        <FieldDescription className="mt-1">
          By pinning the video you make sure it will never disappear from our servers.
        </FieldDescription>
      </FormGroup>
    </Card>
  )
}

export default AvailabilityCard
