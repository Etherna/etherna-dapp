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
import { Link, Navigate } from "react-router-dom"
import classNames from "classnames"

import classes from "@/styles/components/studio/Videos.module.scss"
import { TrashIcon, DocumentDuplicateIcon, PencilIcon } from "@heroicons/react/solid"
import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"
import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"
import { ReactComponent as CreditIcon } from "@/assets/icons/credit.svg"

import StudioTableView from "./StudioTableView"
import VideoDeleteModal from "./video-editor/VideoDeleteModal"
import Button from "@/components/common/Button"
import Image from "@/components/common/Image"
import VideoOffersModal from "@/components/modals/VideoOffersModal"
import SwarmVideoIO from "@/classes/SwarmVideo"
import usePlaylistVideos from "@/hooks/usePlaylistVideos"
import useUserPlaylists from "@/hooks/useUserPlaylists"
import useVideosResources from "@/hooks/useVideosResources"
import routes from "@/routes"
import useSelector from "@/state/useSelector"
import { showError } from "@/state/actions/modals"
import dayjs from "@/utils/dayjs"
import { shortenEthAddr } from "@/utils/ethereum"
import { convertTime } from "@/utils/converters"
import { encodedSvg } from "@/utils/svg"
import type { Profile } from "@/definitions/swarm-profile"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

const Videos: React.FC = () => {
  const profileInfo = useSelector(state => state.profile)
  const address = useSelector(state => state.user.address)
  const { beeClient, indexClient, isStandaloneGateway } = useSelector(state => state.env)

  const [profile, setProfile] = useState<Profile>()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([])
  const [selectedVideoOffers, setSelectedVideoOffers] = useState<{ video: Video, offersStatus: VideoOffersStatus }>()
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

  const { videosOffersStatus, offerVideoResources, unofferVideoResources } = useVideosResources(videos)

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

  useEffect(() => {
    if (videosOffersStatus && selectedVideoOffers) {
      const video = selectedVideoOffers.video
      const offersStatus = videosOffersStatus[video.reference]
      setSelectedVideoOffers(offersStatus ? { video, offersStatus } : undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videosOffersStatus])

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
      })
      try {
        await Promise.allSettled([
          videoWriter.unpinVideo(),
          video.indexReference
            ? await indexClient.videos.deleteVideo(video.indexReference)
            : Promise.resolve(true)
        ])
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

    let newVideos: Video[] = []
    for (let i = 0; i < +count; i++) {
      const newvideo: Video = { ...video }
      newvideo.reference = ""
      newvideo.title = video.title!.replace(/( - \d)?$/, ` - ${start + i}`)

      const writer = new SwarmVideoIO.Writer(newvideo, address!, {
        beeClient,
      })
      await writer.update(profile)
      newVideos.push(writer.video!)
    }

    await addVideosToPlaylist(channelPlaylist!.id, newVideos)

    alert("Copy completed!")
  }

  const renderVideoStatus = (video: Video) => {
    const status = video.isVideoOnIndex
      ? video.isValidatedOnIndex
        ? "public"
        : "processing"
      : "unindexed"
    return (
      <span className={classNames(classes.videoStatus, {
        [classes.public]: status === "public",
        [classes.processing]: status === "processing",
      })}>
        {status.replace(/^[a-z]{1}/, letter => letter.toUpperCase())}
      </span>
    )
  }

  const renderOffersStatus = (video: Video) => {
    if (isStandaloneGateway) {
      return null
    }

    if (videosOffersStatus === undefined) {
      return <Spinner className="w-5 h-5" />
    }

    const videoResourcesStatus = videosOffersStatus[video.reference]
    const status = videoResourcesStatus.offersStatus

    return (
      <button
        className={classNames(classes.offersStatus, {
          [classes.fullOffered]: status === "full",
          [classes.partialOffered]: status === "partial",
          [classes.sourcesOffered]: status === "sources",
        })}
        onClick={() => setSelectedVideoOffers({
          video,
          offersStatus: videoResourcesStatus,
        })}
      >
        <CreditIcon aria-hidden />
        {status === "none" && "None (viewers cost)"}
        {status === "full" && "Fully offered"}
        {status === "sources" && "Video sources offered"}
        {status === "partial" && "Partially offered"}
      </button>
    )
  }

  if (!address) {
    return <Navigate to={routes.home} />
  }

  return (
    <>
      <Button as="a" href={routes.studioVideoNew}>
        Create new video
      </Button>

      <StudioTableView
        className={classes.videoTable}
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
                <Link className={classes.videoTitleText} to={routes.watch(item.indexReference || item.reference)}>
                  <h3>{item.title}</h3>
                </Link>
                {renderVideoStatus(item)}
                {renderOffersStatus(item)}
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
          render: item => renderVideoStatus(item)
        }, isStandaloneGateway ? null : {
          title: "Offered",
          hideOnMobile: true,
          render: item => renderOffersStatus(item)
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
                  <DocumentDuplicateIcon />
                </Button>
              )}
              <Button
                href={routes.studioVideoEdit(item.reference)}
                routeState={{
                  video: item,
                  hasOffers: videosOffersStatus ? videosOffersStatus[item.reference].offersStatus !== "none" : false
                }}
                modifier="transparent"
                iconOnly
              >
                <PencilIcon />
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

      <VideoOffersModal
        show={!!selectedVideoOffers}
        offersStatus={selectedVideoOffers?.offersStatus}
        video={selectedVideoOffers?.video}
        offerResources={async () => await offerVideoResources(selectedVideoOffers!.video)}
        unofferResources={async () => await unofferVideoResources(selectedVideoOffers!.video)}
        onClose={() => setSelectedVideoOffers(undefined)}
      />
    </>
  )
}

export default Videos
