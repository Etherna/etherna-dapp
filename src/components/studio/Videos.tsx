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
import { urlHostname } from "@etherna/sdk-js/utils"

import {
  BoltIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid"
import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"

import VideoOffersStatus from "./other/VideoOffersStatus"
import VideoPinningStatus from "./other/VideoPinningStatus"
import VideoVisibilityStatus from "./other/VideoVisibilityStatus"
import VideoDeleteModal from "./video-editor/VideoDeleteModal"
import VideoMigrationModal from "./video-editor/VideoMigrationModal"
import Image from "@/components/common/Image"
import Time from "@/components/media/Time"
import TableVideoPlaceholder from "@/components/placeholders/TableVideoPlaceholder"
import { Button } from "@/components/ui/actions"
import { Badge, Table, Tooltip } from "@/components/ui/display"
import { Select } from "@/components/ui/inputs"
import useBulkMigrations from "@/hooks/useBulkMigrations"
import useUserVideos from "@/hooks/useUserVideos"
import useUserVideosPinning from "@/hooks/useUserVideosPinning"
import useUserVideosVisibility from "@/hooks/useUserVideosVisibility"
import useVideosResources from "@/hooks/useVideosResources"
import routes from "@/routes"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"
import dayjs from "@/utils/dayjs"
import { shortenEthAddr } from "@/utils/ethereum"
import { encodedSvg } from "@/utils/svg"

import type { VideosSource } from "@/hooks/useUserVideos"
import type { VideoWithIndexes } from "@/types/video"
import type { Profile } from "@etherna/sdk-js"

const Videos: React.FC = () => {
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const defaultBatch = useUserStore(state => state.defaultBatch)
  const profileInfo = useUserStore(state => state.profile)
  const address = useUserStore(state => state.address)
  const indexUrl = useExtensionsStore(state => state.currentIndexUrl)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)

  const canEdit = !!defaultBatch

  const sources = useMemo(() => {
    return [
      { id: "channel", type: "channel" },
      { id: indexUrl, type: "index", indexUrl },
    ] as (VideosSource & { id: string })[]
  }, [indexUrl])
  const [source, setSource] = useState(sources[0].id)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedVideos, setSelectedVideos] = useState<VideoWithIndexes[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMigrationModal, setShowMigrationModal] = useState(false)

  const currentSource = useMemo(() => {
    return sources.find(s => s.id === source)!
  }, [source, sources])

  const profile: Profile = useMemo(() => {
    return {
      batchId: defaultBatchId!,
      address: address!,
      avatar: profileInfo?.avatar ?? null,
      cover: profileInfo?.cover ?? null,
      name: profileInfo?.name ?? shortenEthAddr(address),
      description: profileInfo?.description ?? null,
    }
  }, [address, profileInfo, defaultBatchId])

  const {
    isFetching,
    videos,
    total,
    fetchPage,
    invalidate: invalidatePage,
  } = useUserVideos({
    fetchSource: currentSource,
    sources,
    profile,
    limit: perPage,
  })
  const {
    isFetchingVisibility,
    visibility,
    toggleVideosVisibility,
    invalidate: invalidateVisibility,
  } = useUserVideosVisibility(videos, { sources })
  const {
    isFetchingPinning,
    pinningStatus,
    togglePinning,
    invalidate: invalidatePinning,
  } = useUserVideosPinning(videos)
  const {
    videosOffersStatus,
    isFetchingOffers,
    offerVideoResources,
    unofferVideoResources,
    invalidate: invalidateOffers,
  } = useVideosResources(videos, {
    autoFetch: true,
  })
  const {
    videosToMigrate,
    migrationStatus,
    isMigrating,
    migrate,
    reset: resetMigration,
  } = useBulkMigrations(videos, {
    sourceType: currentSource.type,
    pinningStatus,
    offersStatus: videosOffersStatus,
    visibilityStatus: visibility,
  })

  const selectedVideosToMigrate = useMemo(() => {
    return selectedVideos.filter(vid => videosToMigrate.includes(vid.reference))
  }, [selectedVideos, videosToMigrate])

  useEffect(() => {
    setPage(1)
    fetchPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  useEffect(() => {
    fetchPage(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const invalidate = useCallback(() => {
    invalidatePage(page)
    invalidateVisibility()
    invalidatePinning()
    invalidateOffers()
  }, [invalidateOffers, invalidatePage, invalidatePinning, invalidateVisibility, page])

  const deleteSelectedVideos = useCallback(async () => {
    await toggleVideosVisibility(selectedVideos, currentSource, "unpublished")
    setShowDeleteModal(false)
    fetchPage(page)
  }, [toggleVideosVisibility, fetchPage, currentSource, page, selectedVideos])

  if (!address) {
    return <Navigate to={routes.home} />
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          label="Source:"
          value={source}
          options={sources.map(source => ({
            value: source.id,
            label: source.type === "channel" ? "Public channel" : `Index`,
            description:
              source.type === "channel" ? "Decentralized feed" : urlHostname(source.indexUrl),
          }))}
          onChange={setSource}
        />
        <Button as="a" to={routes.studioVideoNew} disabled={!canEdit}>
          Create new video
        </Button>
      </div>

      <Table
        className="mt-8"
        isLoading={isFetching}
        page={page}
        total={total}
        itemsPerPage={perPage}
        items={videos ?? []}
        loadingSkeleton={<TableVideoPlaceholder />}
        columns={[
          {
            title: "Title",
            render: item => (
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "relative w-14 shrink-0 overflow-hidden md:w-20 lg:w-24 xl:w-28",
                    "bg-gray-300 after:block after:pb-[56.25%] dark:bg-gray-600"
                  )}
                >
                  <Image
                    sources={item.preview.thumbnail?.sources}
                    placeholder="blur"
                    blurredDataURL={item.preview.thumbnail?.blurredBase64}
                    fallbackSrc={
                      item.preview.thumbnail?.blurredBase64
                        ? undefined
                        : encodedSvg(<ThumbPlaceholder />)
                    }
                    layout="fill"
                  />
                  <span className="absolute bottom-0 right-0 rounded-sm bg-black leading-none">
                    <span className="px-1 text-2xs font-semibold text-white dark:text-white">
                      <Time duration={item.preview.duration} />
                    </span>
                  </span>
                </div>
                <div className="flex flex-grow flex-col items-start space-y-2">
                  <Link
                    className=""
                    to={routes.watch(
                      item.indexesStatus[
                        currentSource.type === "index" ? currentSource.indexUrl : ""
                      ]?.indexReference || item.reference
                    )}
                  >
                    <h3 className="text-sm font-bold leading-tight xl:text-base">
                      {item.preview.title}
                    </h3>
                  </Link>
                  <div className="grid auto-cols-max grid-flow-col gap-2 lg:hidden">
                    <VideoVisibilityStatus
                      video={item}
                      visibility={visibility[item.reference]}
                      isLoading={isFetchingVisibility}
                      toggleVisibilityCallback={toggleVideosVisibility}
                    />
                    <VideoOffersStatus
                      video={item}
                      offersStatus={videosOffersStatus?.[item.reference]}
                      isLoading={isFetchingOffers}
                      onOfferResources={() => offerVideoResources(item)}
                      onUnofferResources={() => unofferVideoResources(item)}
                    />
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Visibility",
            hideOnMobile: true,
            render: item => (
              <VideoVisibilityStatus
                video={item}
                visibility={visibility[item.reference]}
                isLoading={isFetchingVisibility}
                toggleVisibilityCallback={toggleVideosVisibility}
                disabled={!canEdit}
              />
            ),
          },
          {
            title: "Pinned",
            hideOnMobile: true,
            render: item => (
              <VideoPinningStatus
                video={item}
                isLoading={isFetchingPinning}
                pinStatus={pinningStatus[item.reference]}
                togglePinningCallback={togglePinning}
                disabled={!canEdit}
              />
            ),
          },
          gatewayType === "bee"
            ? null
            : {
                title: "Offered (by you)",
                hideOnMobile: true,
                render: item => (
                  <VideoOffersStatus
                    video={item}
                    offersStatus={videosOffersStatus?.[item.reference]}
                    isLoading={isFetchingOffers}
                    onOfferResources={() => offerVideoResources(item)}
                    onUnofferResources={() => unofferVideoResources(item)}
                    disabled={!canEdit}
                  />
                ),
              },
          {
            title: "Date",
            hideOnMobile: true,
            render: item =>
              item.preview.createdAt ? (
                <span>
                  <span className="text-sm leading-none xl:hidden">
                    {dayjs(item.preview.createdAt).format("LL")}
                  </span>
                  <span className="hidden text-sm leading-none xl:inline">
                    {dayjs(item.preview.createdAt).format("LLL")}
                  </span>
                </span>
              ) : (
                ""
              ),
          },
          {
            title: "",
            width: "1%",
            render: item => (
              <div className="flex items-center">
                {videosToMigrate.includes(item.reference) && (
                  <Tooltip text="Upgrade required. Re-save this video to update to the latest version">
                    <div>
                      <Badge color="warning" rounded>
                        <InformationCircleIcon width={12} />
                      </Badge>
                    </div>
                  </Tooltip>
                )}
                {item.preview.reference === "" && (
                  <Tooltip text="Cannot download video metadata">
                    <div>
                      <Badge color="error" rounded>
                        <ExclamationCircleIcon width={12} />
                      </Badge>
                    </div>
                  </Tooltip>
                )}
                {item.preview.reference !== "" && (
                  <Button
                    to={routes.studioVideoEdit(item.reference)}
                    routeState={{
                      video: item,
                      hasOffers: videosOffersStatus
                        ? videosOffersStatus[item.reference]?.offersStatus !== "none"
                        : false,
                    }}
                    color="transparent"
                    disabled={!canEdit}
                  >
                    <PencilIcon width={16} aria-hidden />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        selectionActions={
          <div className="flex items-center space-x-4 md:space-x-6">
            {selectedVideosToMigrate.length > 0 && (
              <Button
                color="inverted"
                aspect="text"
                large
                disabled={
                  isMigrating || isFetchingVisibility || isFetchingPinning || isFetchingOffers
                }
                onClick={() => setShowMigrationModal(true)}
              >
                <BoltIcon className="mr-1" width={20} aria-hidden />
                Upgrade
              </Button>
            )}
            <Button color="error" aspect="text" large onClick={() => setShowDeleteModal(true)}>
              <TrashIcon width={20} aria-hidden />
            </Button>
          </div>
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
        source={currentSource}
        videos={selectedVideos}
        deleteHandler={deleteSelectedVideos}
        onCancel={() => setShowDeleteModal(false)}
      />
      <VideoMigrationModal
        show={showMigrationModal}
        videos={selectedVideosToMigrate}
        isMigrating={isMigrating}
        migrationStatus={migrationStatus}
        migrateHandler={signal => migrate(selectedVideosToMigrate, signal)}
        onMigrationCompleted={() => {
          setShowMigrationModal(false)
          resetMigration()
          setSelectedVideos([])
          invalidate()
        }}
        onCancel={() => {
          setShowMigrationModal(false)
          resetMigration()
          setSelectedVideos([])
        }}
      />
    </>
  )
}

export default Videos
