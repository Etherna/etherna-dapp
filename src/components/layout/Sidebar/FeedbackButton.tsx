import React from "react"

import { WindowAtlassian } from "typings/window"

const FeedbackButton = () => {
  const handleFeedback = () => {
    const windowAtlassian = window as WindowAtlassian
    const atl = windowAtlassian.ATL_JQ_PAGE_PROPS || {}
    const showCollectorDialog = atl.showCollectorDialog
    showCollectorDialog && showCollectorDialog()
  }

  return (
    <button id="jira_feedback_btn" className="footer-link" onClick={handleFeedback}>
      Feedback
    </button>
  )
}

export default FeedbackButton
