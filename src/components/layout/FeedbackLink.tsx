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

import React, { useEffect } from "react"

import SidebarLinksItem from "@components/navigation/SidebarLinksItem"

const FeedbackLink = () => {
  useEffect(() => {
    if (import.meta.env.VITE_APP_FEEDBACK_URL) {
      const script = document.createElement("script")
      script.src = import.meta.env.VITE_APP_FEEDBACK_URL
      script.async = true
      script.onload = () => {
        window.ATL_JQ_PAGE_PROPS = {
          triggerFunction: (showCollectorDialog) => {
            window.ATL_JQ_PAGE_PROPS!.showCollectorDialog = showCollectorDialog
          }
        }
      }

      document.body.appendChild(script)
    }
  }, [])

  const handleFeedback = () => {
    const atl = window.ATL_JQ_PAGE_PROPS || {}
    const showCollectorDialog = atl.showCollectorDialog
    showCollectorDialog?.()
  }

  return (
    <SidebarLinksItem
      id="jira_feedback_btn"
      title="Feedback"
      onClick={handleFeedback}
    />
  )
}

export default FeedbackLink
