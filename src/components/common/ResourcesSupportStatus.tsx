import React, { useMemo } from "react"
import { EthernaResourcesHandler } from "@etherna/api-js/handlers"
import { extractVideoReferences } from "@etherna/api-js/utils"
import Tippy from "@tippyjs/react"

import { Spinner } from "@/components/ui/display"
import classNames from "@/utils/classnames"

import type { Video } from "@etherna/api-js"

type ResourcesSupportStatusProps = {
  className?: string
  video: Video | undefined
  isSupportedByUser(reference: string): boolean
  isInProgress(reference: string): boolean
  globalSupportCount(reference: string): number
}

const ResourcesSupportStatus: React.FC<ResourcesSupportStatusProps> = ({
  className,
  video,
  isSupportedByUser,
  isInProgress,
  globalSupportCount,
}) => {
  const resources = useMemo(() => {
    if (!video) return []
    return extractVideoReferences(video)
  }, [video])

  return (
    <div className={classNames(className)}>
      <table className="mt-4 w-full">
        <thead>
          <tr>
            <th />
            <th style={{ width: "100px" }} />
            <th style={{ width: "100px" }} />
          </tr>
        </thead>
        <tbody>
          {resources.map(reference => {
            const globalCount = globalSupportCount(reference)
            const inProgress = isInProgress(reference)
            return (
              <tr key={reference}>
                <th>
                  {video
                    ? EthernaResourcesHandler.videoReferenceLabel(video, reference)
                    : reference}
                </th>
                <td>
                  {(isSupportedByUser(reference) || inProgress) && (
                    <Tippy content="You are supporting this resource">
                      <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold">
                        you
                        {inProgress && <Spinner size={12} />}
                      </span>
                    </Tippy>
                  )}
                </td>
                <td>
                  <Tippy
                    content={`This resource is offered by ${globalSupportCount(reference)} users`}
                  >
                    <span
                      className={classNames(
                        "relative inline-flex h-4 min-w-[1rem] rounded-full px-1 text-xs font-semibold",
                        {
                          "bg-gray-200 text-gray-600 dark:bg-gray-400 dark:text-gray-800":
                            globalCount === 0,
                          "bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white":
                            globalCount > 0,
                        }
                      )}
                    >
                      <span className="absolute-center">{globalSupportCount(reference)}</span>
                    </span>
                  </Tippy>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ResourcesSupportStatus
