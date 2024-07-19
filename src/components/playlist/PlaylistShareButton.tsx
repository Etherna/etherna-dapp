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

import { ShareIcon } from "@heroicons/react/24/solid"

import CopyText from "@/components/common/CopyText"
import { Button, Modal } from "@/components/ui/actions"
import routes from "@/routes"
import { cn } from "@/utils/classnames"

import type { Reference } from "@etherna/sdk-js/clients"

type PlaylistShareButtonProps = {
  className?: string
  rootManifest: Reference
}

const PlaylistShareButton: React.FC<PlaylistShareButtonProps> = ({ className, rootManifest }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        className={cn("size-6 p-px", className)}
        color="transparent"
        aspect="outline"
        rounded
        onClick={() => setShowModal(true)}
      >
        <ShareIcon width={14} aria-hidden />
      </Button>

      <Modal
        title="Share this playlist"
        show={showModal}
        setShow={setShowModal}
        footerButtons={
          <Button color="muted" onClick={() => setShowModal(false)}>
            Done
          </Button>
        }
        large
        showCloseButton
      >
        <CopyText label="Url">
          {import.meta.env.VITE_APP_PUBLIC_URL + routes.playlist(rootManifest)}
        </CopyText>
      </Modal>
    </>
  )
}

export default PlaylistShareButton
