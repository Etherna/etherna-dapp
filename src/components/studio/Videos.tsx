import React, { useEffect, useState } from "react"
import { Redirect } from "react-router-dom"

import classes from "@styles/components/studio/Videos.module.scss"
import { ReactComponent as ThumbPlaceholder } from "@assets/backgrounds/thumb-placeholder.svg"
import { ReactComponent as EditIcon } from "@assets/icons/edit.svg"
import { ReactComponent as TrashIcon } from "@assets/icons/trash.svg"

import StudioTableView from "./StudioTableView"
import VideoDeleteModal from "./video-editor/VideoDeleteModal"
import Button from "@common/Button"
import Image from "@common/Image"
import SwarmVideoIO from "@classes/SwarmVideo"
import usePlaylistVideos from "@hooks/usePlaylistVideos"
import useUserPlaylists from "@hooks/useUserPlaylists"
import routes from "@routes"
import useSelector from "@state/useSelector"
import dayjs from "@utils/dayjs"
import { shortenEthAddr } from "@utils/ethereum"
import { convertTime } from "@utils/converters"
import { encodedSvg } from "@utils/svg"
import type { Profile } from "@definitions/swarm-profile"
import type { Video } from "@definitions/swarm-video"
import { showError } from "@state/actions/modals"

const TABLE_LIMIT = 20

const Videos: React.FC = () => {
  const profileInfo = useSelector(state => state.profile)
  const address = useSelector(state => state.user.address)
  const { beeClient, indexClient } = useSelector(state => state.env)

  const [profile, setProfile] = useState<Profile>()
  const [page, setPage] = useState(1)
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    channelPlaylist,
    loadPlaylists,
    removeVideosFromPlaylist,
  } = useUserPlaylists(address!, { resolveChannel: true })

  const { videos, total, isFetching, fetchPage } = usePlaylistVideos(channelPlaylist, {
    owner: profile,
    autofetch: false,
    limit: TABLE_LIMIT,
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
  }, [channelPlaylist, profile, page])

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
  }

  if (!address) {
    return <Redirect to={routes.getHomeLink()} />
  }

  return (
    <>
      <StudioTableView
        title="Videos"
        isLoading={isFetching}
        page={page}
        total={total}
        itemsPerPage={TABLE_LIMIT}
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
            <Button
              as="a"
              href={routes.getStudioVideoEditLink(item.reference)}
              modifier="transparent"
              iconOnly
            >
              <EditIcon />
            </Button>
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
        onPageChange={page => setPage(page)}
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
