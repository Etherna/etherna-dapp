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
import React, { useMemo } from "react"
import { EthernaResourcesHandler } from "@etherna/api-js/handlers"
import { extractReference } from "@etherna/api-js/utils"

import { FilmIcon, PhotoIcon } from "@heroicons/react/20/solid"
import { ReactComponent as ManifestIcon } from "@/assets/icons/manifest.svg"

import { Button, Modal } from "@/components/ui/actions"
import useClientsStore from "@/stores/clients"

import type { Video } from "@etherna/api-js"

type VideoExtraMenuManifestProps = {
  video: Video
  show: boolean
  setShow(show: boolean): void
}

const VideoExtraMenuManifest: React.FC<VideoExtraMenuManifestProps> = ({
  video,
  show,
  setShow,
}) => {
  const beeClient = useClientsStore(state => state.beeClient)

  const sources = useMemo(() => {
    const references = EthernaResourcesHandler.videoReferences(video)
    return references.map(reference => ({
      reference,
      type: EthernaResourcesHandler.videoReferenceType(video, reference),
      label: EthernaResourcesHandler.videoReferenceLabel(video, reference),
    }))
  }, [video])

  return (
    <Modal
      title="Decentralized information"
      show={show}
      setShow={setShow}
      showCancelButton={false}
      showCloseButton={false}
      footerButtons={<Button onClick={() => setShow(false)}>OK</Button>}
    >
      <p>
        <span>You can access all the video data directly on the </span>
        <strong>
          <a
            className="text-current"
            href="https://www.ethswarm.org"
            target="_blank"
            rel="noreferrer"
            tabIndex={-1}
          >
            Swarm Decentralized Network
          </a>
        </strong>
        <span> with the hashes provided below</span>
      </p>
      <ul className="mt-4 flex flex-col">
        {sources.map(source => (
          <li className="mt-3 flex flex-col text-sm font-medium" key={source.reference}>
            <div className="flex items-center text-base font-semibold">
              {source.type === "metadata" && (
                <ManifestIcon width={16} className="mr-1" aria-hidden />
              )}
              {source.type === "video" && <FilmIcon width={16} className="mr-1" aria-hidden />}
              {source.type === "thumb" && <PhotoIcon width={16} className="mr-1" aria-hidden />}
              {source.label}
            </div>
            <span className="block w-full break-words text-xs text-gray-400 dark:text-gray-400">
              <a href={beeClient.bzz.url(source.reference)} target="_blank" rel="noreferrer">
                {source.reference}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export default VideoExtraMenuManifest
