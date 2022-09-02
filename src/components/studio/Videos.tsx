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

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import classNames from "classnames"

import classes from "@/styles/components/studio/Videos.module.scss"
import { TrashIcon, PencilIcon, InformationCircleIcon } from "@heroicons/react/solid"
import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"
import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"
import { ReactComponent as CreditIcon } from "@/assets/icons/credit.svg"

import StudioTableView from "./StudioTableView"
import VideoDeleteModal from "./video-editor/VideoDeleteModal"
import Button from "@/components/common/Button"
import Image from "@/components/common/Image"
import CustomSelect from "@/components/common/CustomSelect"
import VideoOffersModal from "@/components/modals/VideoOffersModal"
import useUserVideos from "@/hooks/useUserVideos"
import useVideosResources from "@/hooks/useVideosResources"
import useVideosIndexStatus from "@/hooks/useVideosIndexStatus"
import routes from "@/routes"
import useSelector from "@/state/useSelector"
import { shortenEthAddr } from "@/utils/ethereum"
import { convertTime } from "@/utils/converters"
import { encodedSvg } from "@/utils/svg"
import { urlHostname } from "@/utils/urls"
import dayjs from "@/utils/dayjs"
import type { Profile } from "@/definitions/swarm-profile"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"
import type { VideosSource } from "@/hooks/useUserVideos"
import SwarmVideoIO from "@/classes/SwarmVideo"
import Badge from "../common/Badge"
import Tooltip from "../common/Tooltip"

const Videos: React.FC = () => {
  const profileInfo = useSelector(state => state.profile)
  const address = useSelector(state => state.user.address)
  const indexUrl = useSelector(state => state.env.indexUrl)
  const gatewayClient = useSelector(state => state.env.gatewayClient)
  const gatewayType = useSelector(state => state.env.gatewayType)

  const sources = useMemo(() => {
    return [
      { id: "channel", type: "channel" },
      { id: indexUrl, type: "index", indexUrl },
    ] as (VideosSource & { id: string })[]
  }, [indexUrl])
  const [source, setSource] = useState(sources[0].id)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([])
  const [selectedVideoOffers, setSelectedVideoOffers] = useState<{ video: Video, offersStatus: VideoOffersStatus }>()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const currentSource = useMemo(() => {
    return sources.find(s => s.id === source)!
  }, [source, sources])

  const profile: Profile = useMemo(() => {
    return {
      address: address!,
      avatar: profileInfo.avatar ?? null,
      cover: profileInfo.cover ?? null,
      name: profileInfo.name ?? shortenEthAddr(address),
      description: profileInfo.description ?? null
    }
  }, [address, profileInfo])

  const { isFetching, videos, total, fetchPage, deleteVideosFromSource } = useUserVideos({
    source: currentSource,
    profile,
    limit: perPage,
  })
  const { videosOffersStatus, offerVideoResources, unofferVideoResources } = useVideosResources(videos)
  const { videosIndexStatus } = useVideosIndexStatus(videos, indexUrl)

  useEffect(() => {
    setPage(1)
    fetchPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  useEffect(() => {
    if (videosOffersStatus && selectedVideoOffers) {
      const video = selectedVideoOffers.video
      const offersStatus = videosOffersStatus[video.reference]
      setSelectedVideoOffers(offersStatus ? { video, offersStatus } : undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videosOffersStatus])

  const deleteSelectedVideos = useCallback(async () => {
    await deleteVideosFromSource(selectedVideos)
    setShowDeleteModal(false)
  }, [deleteVideosFromSource, selectedVideos])

  const renderVideoStatus = useCallback((video: Video) => {
    if (videosIndexStatus === undefined) {
      return <Spinner className="w-5 h-5" />
    }

    const status = videosIndexStatus[video.reference] ?? "unindexed"

    return (
      <Badge
        color={status === "public" ? "success" : status === "processing" ? "info" : "muted"}
        small
      >
        {status.replace(/^[a-z]{1}/, letter => letter.toUpperCase())}
      </Badge>
    )
  }, [videosIndexStatus])

  const renderOffersStatus = useCallback((video: Video) => {
    if (gatewayType === "bee") {
      return null
    }

    if (videosOffersStatus === undefined || videosOffersStatus[video.reference] === undefined) {
      return <Spinner className="w-5 h-5" />
    }

    const videoResourcesStatus = videosOffersStatus[video.reference]
    const status = videoResourcesStatus.userOffersStatus

    return (
      <Badge
        color={
          status === "full"
            ? "success"
            : status === "partial"
              ? "indigo"
              : status === "sources"
                ? "info"
                : "muted"
        }
        small
        prefix={<CreditIcon width={16} aria-hidden />}
        onClick={() => setSelectedVideoOffers({
          video,
          offersStatus: videoResourcesStatus,
        })}
      >
        {status === "none" && "No offers (viewers cost)"}
        {status === "full" && "Fully offered"}
        {status === "sources" && "Video sources offered"}
        {status === "partial" && "Partially offered"}
      </Badge>
    )
  }, [gatewayType, videosOffersStatus])

  if (!address) {
    return <Navigate to={routes.home} />
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between">
        <CustomSelect
          label="Source:"
          value={source}
          options={
            sources.map(source => ({
              value: source.id,
              label: source.type === "channel" ? "Public channel" : `Index`,
              description: source.type === "channel" ? "Decentralized feed" : urlHostname(source.indexUrl)
            }))}
          onChange={setSource}
        />
        <Button as="a" href={routes.studioVideoNew}>
          Create new video
        </Button>
      </div>

      <StudioTableView
        className={classNames(classes.videoTable, "mt-8")}
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
                <div className={classes.videoBadges}>
                  {renderVideoStatus(item)}
                  {renderOffersStatus(item)}
                </div>
              </div>
            </div>
          )
        }, {
          title: "Duration",
          hideOnMobile: true,
          render: item => convertTime(item.duration).readable
        }, {
          title: "Index Status",
          hideOnMobile: true,
          render: item => renderVideoStatus(item)
        }, gatewayType === "bee" ? null : {
          title: "Offered (by you)",
          hideOnMobile: true,
          render: item => renderOffersStatus(item)
        }, {
          title: "Date",
          hideOnMobile: true,
          render: item => item.createdAt ? dayjs(item.createdAt).format("LLL") : ""
        }, {
          title: "",
          width: "1%",
          render: item => (
            <div className="flex items-center">
              {(!item.v || +item.v < +SwarmVideoIO.lastVersion || !item.batchId) && (
                <Tooltip text="Migration required">
                  <div>
                    <Badge color="warning" rounded>
                      <InformationCircleIcon width={12} />
                    </Badge>
                  </div>
                </Tooltip>
              )}
              <Button
                href={routes.studioVideoEdit(item.reference)}
                routeState={{
                  video: item,
                  hasOffers: videosOffersStatus ? videosOffersStatus[item.reference]?.offersStatus !== "none" : false
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
        source={currentSource}
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
