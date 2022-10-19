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
import { Link } from "react-router-dom"
import type { EthAddress, IndexVideoComment } from "@etherna/api-js/clients"
import classNames from "classnames"

import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/solid"

import MarkdownPreview from "@/components/common/MarkdownPreview"
import VideoCommentPlaceholder from "@/components/placeholders/VideoCommentPlaceholder"
import { Dropdown } from "@/components/ui/actions"
import { Avatar, Spinner } from "@/components/ui/display"
import useConfirmation from "@/hooks/useConfirmation"
import useErrorMessage from "@/hooks/useErrorMessage"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import routes from "@/routes"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import dayjs from "@/utils/dayjs"
import { shortenEthAddr } from "@/utils/ethereum"

type VideoCommentsItemProps = {
  comment: IndexVideoComment
  videoAuthorAddress?: string | null
  onDelete?(): void
}

const VideoCommentsItem: React.FC<VideoCommentsItemProps> = ({
  comment,
  videoAuthorAddress,
  onDelete,
}) => {
  const address = useUserStore(state => state.address)
  const indexClient = useClientsStore(state => state.indexClient)
  const { creationDateTime, text, ownerAddress } = comment
  const { profile, isLoading, loadProfile } = useSwarmProfile({
    address: ownerAddress as EthAddress,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const { waitConfirmation } = useConfirmation()
  const { showError } = useErrorMessage()

  useEffect(() => {
    if (!profile || ownerAddress !== profile.address) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment])

  const deleteComment = useCallback(async () => {
    const confirm = await waitConfirmation(
      "Are you sure you want to delete this comment?",
      "This action cannot be undone.",
      "Yes, Delete",
      "destructive"
    )
    if (confirm) {
      setIsDeleting(true)
      try {
        await indexClient.comments.deleteComment(comment.id)
        onDelete?.()
      } catch (error) {
        console.error(error)
        showError(
          "Coudn't delete the comment",
          "Please try again later or contact us if the problem persists."
        )
      } finally {
        setIsDeleting(false)
      }
    }
  }, [comment.id, indexClient, waitConfirmation, showError, onDelete])

  if (isLoading) return <VideoCommentPlaceholder />

  return (
    <div className="mb-3 flex items-start">
      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700">
        <Avatar className="h-full w-full" image={profile?.avatar} address={ownerAddress} />
      </div>
      <div className="ml-2 flex-1">
        <div className="flex items-center">
          <Link
            to={routes.channel(ownerAddress)}
            className={classNames(
              "text-sm font-semibold",
              "text-gray-800 hover:text-black dark:text-gray-300 dark:hover:text-gray-100",
              {
                "rounded-full px-2 py-0.5": videoAuthorAddress === ownerAddress,
                "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200":
                  videoAuthorAddress === ownerAddress,
              }
            )}
          >
            {profile?.name || shortenEthAddr(ownerAddress)}
          </Link>
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            {dayjs.duration(dayjs(creationDateTime).diff(dayjs())).humanize(true)}
          </span>

          {address === ownerAddress && !comment.isFrozen && (
            <Dropdown className="ml-auto">
              <Dropdown.Toggle>
                <EllipsisVerticalIcon width={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu className="max-w-[8rem]" placement="bottom-end">
                <Dropdown.Item
                  className="text-red-500 dark:text-red-500"
                  icon={
                    isDeleting ? (
                      <Spinner size={18} type="bouncing-line" />
                    ) : (
                      <TrashIcon width={16} />
                    )
                  }
                  action={deleteComment}
                >
                  {isDeleting ? "Deleting" : "Delete"}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        <MarkdownPreview
          className={classNames("mt-1 break-all", {
            "text-gray-400 dark:text-gray-500": comment.isFrozen,
          })}
          value={text}
        />
      </div>
    </div>
  )
}

export default VideoCommentsItem
