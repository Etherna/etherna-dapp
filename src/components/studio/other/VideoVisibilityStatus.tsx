import React, { useCallback, useState } from "react"
import { urlHostname } from "@etherna/sdk-js/utils"
import { Portal } from "@headlessui/react"

import { ChevronDownIcon } from "@heroicons/react/24/solid"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import { Button, Dropdown } from "@/components/ui/actions"
import { Badge, Spinner } from "@/components/ui/display"
import { Toggle } from "@/components/ui/inputs"
import useChannelPlaylists from "@/hooks/useChannelPlaylists"

import type { VideosSource } from "@/hooks/useUserVideos"
import type { VisibilityStatus } from "@/hooks/useUserVideosVisibility"
import type useUserVideosVisibility from "@/hooks/useUserVideosVisibility"
import type { VideoWithIndexes } from "@/types/video"

type VideoVisibilityStatusProps = {
  className?: string
  video: VideoWithIndexes
  visibility: VisibilityStatus[]
  isLoading?: boolean
  disabled?: boolean
  toggleVisibilityCallback: ReturnType<typeof useUserVideosVisibility>["toggleVideosVisibility"]
}

const VideoVisibilityStatus: React.FC<VideoVisibilityStatusProps> = ({
  className,
  visibility,
  isLoading,
  video,
  disabled,
  toggleVisibilityCallback,
}) => {
  const [isToggling, setIsToggling] = useState(false)

  const { allPlaylists } = useChannelPlaylists()

  const renderBadge = useCallback(
    (sourceVisibility: VisibilityStatus, withLabel: boolean) => {
      return (
        <Badge
          color={
            sourceVisibility.status === "public"
              ? "success"
              : sourceVisibility.status === "processing"
                ? "info"
                : "muted"
          }
          variant="outline"
          small
          key={sourceVisibility.sourceIdentifier}
        >
          {withLabel && (
            <>
              <span>
                {sourceVisibility.sourceType === "playlist"
                  ? sourceVisibility.sourceIdentifier === SwarmPlaylist.Reader.channelPlaylistId
                    ? "Public Channel"
                    : allPlaylists.find(
                        playlist => playlist.preview.id === sourceVisibility.sourceIdentifier
                      )?.preview.name || "Channel playlist"
                  : urlHostname(sourceVisibility.sourceIdentifier)}
              </span>
              <span>: </span>
            </>
          )}
          <span>{sourceVisibility.status}</span>
        </Badge>
      )
    },
    [allPlaylists]
  )

  const toggleVisibility = useCallback(
    async (currentStatus: VisibilityStatus) => {
      setIsToggling(true)
      const nextStatus = currentStatus.status === "public" ? "unpublished" : "published"
      const source: VideosSource =
        currentStatus.sourceType === "playlist"
          ? { type: "playlist", id: currentStatus.sourceIdentifier }
          : { type: "index", indexUrl: currentStatus.sourceIdentifier }
      await toggleVisibilityCallback([video], source, nextStatus)
      setIsToggling(false)
    },
    [toggleVisibilityCallback, video]
  )

  if (isLoading) {
    return <Spinner className="h-5 w-5" />
  }

  if (!visibility) return null

  return (
    <Dropdown className={className}>
      <Dropdown.Toggle disabled={disabled}>
        <Button
          as="div"
          className={!disabled ? "rounded p-1 hover:bg-gray-500/30" : ""}
          suffix={<ChevronDownIcon width={14} />}
          aspect="text"
          color="inverted"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {visibility.map(sourceVisibility => renderBadge(sourceVisibility, true))}
          </div>
        </Button>
      </Dropdown.Toggle>

      <Portal>
        <Dropdown.Menu className="px-6 text-sm">
          <ul className="flex flex-col space-y-4 divide-y divide-gray-500 pb-4">
            {visibility.map((sourceVisibility, i) => (
              <li className="flex pt-3" key={i}>
                <div className="flex flex-col items-start">
                  <span>
                    {(() => {
                      switch (sourceVisibility.sourceType) {
                        case "index":
                          return "Index"
                        case "playlist":
                          const playlist = allPlaylists.find(
                            playlist => playlist.preview.id === sourceVisibility.sourceIdentifier
                          )
                          return playlist?.preview.id === SwarmPlaylist.Reader.channelPlaylistId
                            ? "Public Channel"
                            : playlist?.preview.name || "Channel playlist"
                      }
                    })()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      switch (sourceVisibility.sourceType) {
                        case "index":
                          return sourceVisibility.sourceIdentifier
                        case "playlist":
                          const playlist = allPlaylists.find(
                            playlist => playlist.preview.id === sourceVisibility.sourceIdentifier
                          )
                          return playlist?.preview.id === SwarmPlaylist.Reader.channelPlaylistId
                            ? "All videos in the public channel"
                            : playlist?.details.description || "Decentralized feed"
                      }
                    })()}
                  </span>
                  <span className="mt-2">{renderBadge(sourceVisibility, false)}</span>
                  {sourceVisibility.errors?.length && (
                    <ul className="text-xs leading-none text-red-500">
                      {sourceVisibility.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {isToggling ? (
                  <Spinner size={16} />
                ) : (
                  <Toggle
                    className="ml-auto"
                    checked={
                      sourceVisibility.status === "public" ||
                      sourceVisibility.status === "processing"
                    }
                    onChange={() => toggleVisibility(sourceVisibility)}
                  />
                )}
              </li>
            ))}
          </ul>
        </Dropdown.Menu>
      </Portal>
    </Dropdown>
  )
}

export default VideoVisibilityStatus
