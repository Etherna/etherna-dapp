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

import classes from "@styles/components/video/VideoExtraMenuReport.module.scss"

import AlertPopup from "@common/AlertPopup"
import Button from "@common/Button"
import Modal from "@common/Modal"
import useSelector from "@state/useSelector"
import { useErrorMessage } from "@state/hooks/ui"

type VideoExtraMenuReportProps = {
  videoId: string
  videoReference: string
  show: boolean
  setShow(show: boolean): void
}

const CODES: Record<string, string> = {
  sexual_content: "Sexual content",
  violent_repulsive_content: "Violent or repulsive content",
  hateful_abusive_content: "Hateful or abusive content",
  harassment_bullying: "Harassment or bullying",
  harmful_dangerous_acts: "Harmful or dangerous acts",
  child_abuse: "Child abuse",
  promotes_terrorism: "Promotes terrorism",
  copyright: "Infringes my rights",
}

const VideoExtraMenuReport: React.FC<VideoExtraMenuReportProps> = ({
  videoId,
  videoReference,
  show,
  setShow,
}) => {
  const { indexClient } = useSelector(state => state.env)
  const { showError } = useErrorMessage()

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [reportCode, setReportCode] = useState("")

  const sendReport = async () => {
    setIsReporting(true)
    try {
      await indexClient.videos.reportVideo(videoId, videoReference, reportCode)

      setShow(false)
      setShowSuccessMessage(true)
    } catch (error: any) {
      showError("Cannot report video", error.message)
    }
    setIsReporting(false)
  }

  return (
    <>
      <Modal
        title="Report video"
        show={show}
        setShow={setShow}
        footerButtons={
          <Button onClick={sendReport} loading={isReporting} disabled={!reportCode}>
            Report video
          </Button>
        }
        showCancelButton
      >
        <div className={classes.reportList}>
          {Object.keys(CODES).map(key => (
            <label className={classes.reportRadio} htmlFor={key} key={key}>
              <input id={key} type="radio" checked={reportCode === key} onChange={() => setReportCode(key)} />
              <span>{CODES[key]}</span>
            </label>
          ))}
        </div>
      </Modal>

      <AlertPopup
        show={showSuccessMessage}
        title="Report sent"
        message="We will review the video in the next 24-48 hours"
        onAction={() => setShowSuccessMessage(false)}
      />
    </>
  )
}

export default VideoExtraMenuReport