const FeedbackButton = () => {
  const handleFeedback = () => {
    const atl = window.ATL_JQ_PAGE_PROPS || {}
    const showCollectorDialog = atl.showCollectorDialog
    showCollectorDialog?.()
  }

  return (
    <button id="jira_feedback_btn" className="footer-link" onClick={handleFeedback}>
      Feedback
    </button>
  )
}

export default FeedbackButton
