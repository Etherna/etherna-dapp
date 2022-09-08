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

import React, { useCallback, useEffect, useState } from "react"

import type { Sidebar, Tabbar } from "@/components/ui/navigation"
import type { SidebarLinksItemProps } from "@/components/ui/navigation/Sidebar"
import type { TabbarItemProps } from "@/components/ui/navigation/Tabbar"

type FeedbackLinkProps =
  | ({
      wrapper: typeof Sidebar.LinksItem
    } & SidebarLinksItemProps)
  | ({
      wrapper: typeof Tabbar.Item
    } & TabbarItemProps)

const FeedbackLink: React.FC<FeedbackLinkProps> = ({ wrapper: Wrapper, ...props }) => {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (import.meta.env.VITE_APP_FEEDBACK_URL) {
      const script = document.createElement("script")
      script.src = import.meta.env.VITE_APP_FEEDBACK_URL
      script.async = true
      script.onload = () => {
        window.ATL_JQ_PAGE_PROPS = {
          triggerFunction: showCollectorDialog => {
            window.ATL_JQ_PAGE_PROPS!.showCollectorDialog = showCollectorDialog
          },
        }
        setTimeout(() => {
          if (!window.ATL_JQ_PAGE_PROPS!.showCollectorDialog) {
            setBlocked(true)
          }
        }, 500)
      }

      document.body.appendChild(script)
    }
  }, [])

  const handleFeedback = useCallback(() => {
    window.ATL_JQ_PAGE_PROPS?.showCollectorDialog?.()
  }, [])

  return (
    <Wrapper
      id="jira_feedback_btn"
      title="Feedback"
      tooltip={blocked ? "The feedback script has been blocked by your AdBlocker" : undefined}
      disabled={blocked}
      onClick={handleFeedback}
      {...props}
    />
  )
}

export default FeedbackLink
