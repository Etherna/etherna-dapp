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

import React, { useEffect, useState } from "react"
import { Redirect } from "react-router-dom"

import classes from "@styles/components/studio/Videos.module.scss"
import { ReactComponent as ThumbPlaceholder } from "@assets/backgrounds/thumb-placeholder.svg"
import { ReactComponent as EditIcon } from "@assets/icons/edit.svg"
import { ReactComponent as TrashIcon } from "@assets/icons/trash.svg"
import { ReactComponent as CopyIcon } from "@assets/icons/copy.svg"

import StudioTableView from "./StudioTableView"
import VideoDeleteModal from "./video-editor/VideoDeleteModal"
import Button from "@common/Button"
import Image from "@common/Image"
import SwarmVideoIO from "@classes/SwarmVideo"
import usePlaylistVideos from "@hooks/usePlaylistVideos"
import useUserPlaylists from "@hooks/useUserPlaylists"
import routes from "@routes"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import dayjs from "@utils/dayjs"
import { shortenEthAddr } from "@utils/ethereum"
import { convertTime } from "@utils/converters"
import { encodedSvg } from "@utils/svg"
import uuidv4 from "@utils/uuid"
import type { Profile } from "@definitions/swarm-profile"
import type { Video } from "@definitions/swarm-video"

const Videos: React.FC = () => {
  const profileInfo = useSelector(state => state.profile)
  const address = useSelector(state => state.user.address)
  const { beeClient, indexClient } = useSelector(state => state.env)

  const [profile, setProfile] = useState<Profile>()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    channelPlaylist,
    loadPlaylists,
    addVideosToPlaylist,
    removeVideosFromPlaylist,
  } = useUserPlaylists(address!, { resolveChannel: true })

  const { videos, total, isFetching, fetchPage } = usePlaylistVideos(channelPlaylist, {
    owner: profile,
    autofetch: false,
    limit: perPage,
  })

  useEffect(() => {
    if (address) {
      setProfile({
        address,
        avatar: profileInfo.avatar ?? null,
        cover: profileInfo.cover ?? null,
        name: profileInfo.name ?? shortenEthAddr(address),
        description: profileInfo.description ?? null
      })
      loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    if (channelPlaylist && profile) {
      fetchPage(page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelPlaylist, profile, page, perPage])

  const deleteSelectedVideos = async () => {
    if (!channelPlaylist) {
      return showError(
        "Channel error",
        "Channel video list not fetched."
      )
    }

    const removedReferences: string[] = []
    for (const video of selectedVideos) {
      const videoWriter = new SwarmVideoIO.Writer(video, video.ownerAddress || address!, {
        beeClient,
        indexClient,
      })
      try {
        await videoWriter.deleteVideo()
        removedReferences.push(video.reference)
      } catch (error: any) {
        showError(`Cannot delete the video: ${video.title}`, error.message)
      }
    }
    await removeVideosFromPlaylist(channelPlaylist.id, removedReferences)

    setShowDeleteModal(false)
  }

  const duplicateVideo = async (video: Video) => {
    const count = prompt("Count", "1")
    if (!count) return

    const start = (channelPlaylist!.videos?.length ?? 0) + 1

    let newReferences: string[] = []
    for (let i = 0; i < +count; i++) {
      const newvideo: Video = { ...video }
      newvideo.id = uuidv4()
      newvideo.reference = ""
      newvideo.title = video.title!.replace(/( - \d)?$/, ` - ${start + i}`)

      const writer = new SwarmVideoIO.Writer(newvideo, address!, {
        beeClient,
        indexClient,
      })
      const reference = await writer.update(profile)
      newReferences.push(reference)
    }

    await addVideosToPlaylist(channelPlaylist!.id, newReferences)

    alert("Copy completed!")
  }

  if (!address) {
    return <Redirect to={routes.getHomeLink()} />
  }

  return (
    <>
      <StudioTableView
        className={classes.videoTable}
        title="Videos"
        isLoading={isFetching}
        page={page}
        total={total}
        itemsPerPage={perPage}
        items={videos ?? []}
        columns={[{
          title: "Title",
          render: item => (
            <div className={classes.videoTitle}>
              <div className={classes.videoTitleThumb}>
                <Image
                  src={encodedSvg(<ThumbPlaceholder />)}
                  sources={item.thumbnail?.sources}
                  placeholder="blur"
                  blurredDataURL={item.thumbnail?.blurredBase64}
                  fallbackSrc={encodedSvg(<ThumbPlaceholder />)}
                  layout="fill"
                />
              </div>
              <div className={classes.videoTitleInfo}>
                <h3 className={classes.videoTitleTitle}>{item.title}</h3>
                <span className={classes.videoTitleStatus}>
                  {item.isVideoOnIndex ? "Published" : "Unindex"}
                </span>
              </div>
            </div>
          )
        }, {
          title: "Duration",
          hideOnMobile: true,
          render: item => convertTime(item.duration).readable
        }, {
          title: "Status",
          hideOnMobile: true,
          render: item => (
            <span className={classes.videoTitleStatus}>
              {item.isVideoOnIndex ? "Published" : "Unindex"}
            </span>
          )
        }, {
          title: "Date",
          hideOnMobile: true,
          render: item => item.creationDateTime ? dayjs(item.creationDateTime).format("LLL") : ""
        }, {
          title: "",
          width: "1%",
          render: item => (
            <div className="flex">
              {import.meta.env.DEV && (
                <Button
                  modifier="transparent"
                  onClick={() => duplicateVideo(item)}
                  iconOnly
                >
                  <CopyIcon />
                </Button>
              )}
              <Button
                as="a"
                href={routes.getStudioVideoEditLink(item.reference)}
                modifier="transparent"
                iconOnly
              >
                <EditIcon />
              </Button>
            </div>
          )
        }]}
        selectionActions={
          <>
            <Button
              modifier="transparent"
              iconOnly
              large
              onClick={() => setShowDeleteModal(true)}
            >
              <TrashIcon />
            </Button>
          </>
        }
        onSelectionChange={setSelectedVideos}
        onPageChange={(page, perPage) => {
          setPage(page)
          perPage && setPerPage(perPage)
        }}
        showSelection
      />

      <VideoDeleteModal
        show={showDeleteModal}
        videos={selectedVideos}
        deleteHandler={deleteSelectedVideos}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  )
}

export default Videos