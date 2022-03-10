import React, { useState } from "react"

import { ReactComponent as ShareIcon } from "@assets/icons/share.svg"

import VideoDetailsButton from "./VideoDetailsButton"
import CopyText from "@common/CopyText"
import Modal from "@common/Modal"
import Button from "@common/Button"
import SegmentedControl from "@common/SegmentedControl"
import routes from "@routes"

type VideoShareButtonProps = {
  reference: string
  indexReference: string | null | undefined
}

const VideoShareButton: React.FC<VideoShareButtonProps> = ({ reference, indexReference }) => {
  const [showModal, setShowModal] = useState(false)
  const [sharePage, setSharePage] = useState<"link" | "embed">("link")

  const getIFrame = (src: string) => {
    return "<iframe " +
      `src=\"${src}\" ` +
      "allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" " +
      "allowfullscreen></iframe>"
  }

  return (
    <>
      <VideoDetailsButton onClick={() => setShowModal(true)}>
        <ShareIcon aria-hidden />
        Share
      </VideoDetailsButton>

      <Modal
        title="Share this video"
        show={showModal}
        setShow={setShowModal}
        footerButtons={
          <Button modifier="muted" onClick={() => setShowModal(false)}>
            Done
          </Button>
        }
        large
        showCloseButton
      >
        <SegmentedControl
          defaultValue={sharePage}
          value={sharePage}
          entries={[{
            label: "Link",
            value: "link"
          }, {
            label: "Embed",
            value: "embed"
          }]}
          onChange={val => setSharePage(val as any)}
        />

        <div className="space-y-4 mt-6">
          {sharePage === "link" && indexReference && (
            <CopyText label="Index">
              {import.meta.env.VITE_APP_PUBLIC_URL + routes.watch(indexReference)}
            </CopyText>
          )}
          {sharePage === "link" && (
            <CopyText label="Decentralized">
              {import.meta.env.VITE_APP_PUBLIC_URL + routes.watch(reference)}
            </CopyText>
          )}

          {sharePage === "embed" && indexReference && (
            <CopyText label="Index">
              {getIFrame(import.meta.env.VITE_APP_PUBLIC_URL + routes.embed(indexReference))}
            </CopyText>
          )}
          {sharePage === "embed" && (
            <CopyText label="Decentralized">
              {getIFrame(import.meta.env.VITE_APP_PUBLIC_URL + routes.embed(reference))}
            </CopyText>
          )}
        </div>
      </Modal>
    </>
  )
}

export default VideoShareButton
