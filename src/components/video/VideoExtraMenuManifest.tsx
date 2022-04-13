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

import classes from "@styles/components/video/VideoExtraMenuManifest.module.scss"
import { FilmIcon, PhotographIcon } from "@heroicons/react/solid"
import { ReactComponent as ManifestIcon } from "@assets/icons/manifest.svg"

import Button from "@common/Button"
import Modal from "@common/Modal"
import SwarmResourcesIO from "@classes/SwarmResources"
import useSelector from "@state/useSelector"
import type { Video } from "@definitions/swarm-video"

type VideoExtraMenuManifestProps = {
  video: Video
  show: boolean
  setShow(show: boolean): void
}

const VideoExtraMenuManifest: React.FC<VideoExtraMenuManifestProps> = ({ video, show, setShow }) => {
  const { beeClient } = useSelector(state => state.env)

  const sources = useMemo(() => {
    const references = SwarmResourcesIO.getVideoReferences(video)
    return references.map(reference => ({
      reference,
      type: SwarmResourcesIO.getVideoReferenceType(video, reference),
      label: SwarmResourcesIO.getVideoReferenceLabel(video, reference),
    }))
  }, [video])

  return (
    <Modal
      title="Decentralized information"
      show={show}
      setShow={setShow}
      showCancelButton={false}
      showCloseButton={false}
      footerButtons={
        <Button onClick={() => setShow(false)}>
          OK
        </Button>
      }
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
      <ul className={classes.sourcesList}>
        {sources.map(source => (
          <li className={classes.sourcesListItem} key={source.reference}>
            <div className={classes.sourcesListItemTitle}>
              {source.type === "metadata" && <ManifestIcon aria-hidden />}
              {source.type === "video" && <FilmIcon aria-hidden />}
              {source.type === "thumb" && <PhotographIcon aria-hidden />}
              {source.label}
            </div>
            <span className={classes.sourcesListItemLink}>
              {source.reference}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export default VideoExtraMenuManifest
