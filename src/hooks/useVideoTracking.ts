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
 */

import { useCallback, useEffect, useRef, useState } from "react"

import type { MediaPlayerElement } from "vidstack"

export default function useVideoTracking(mediaEl: MediaPlayerElement | null | undefined) {
  const [tracker, setTracker] = useState<MediaAnalyticsTracker>()
  const resizeObserver = useRef<ResizeObserver>()

  useEffect(() => {
    if (!mediaEl) return
    if (!window.Matomo?.MediaAnalytics) return
    if (!!tracker) return

    const MA = window.Matomo!.MediaAnalytics
    // find the actual resource / URL of the video
    const resource = mediaEl.dataset.src || mediaEl.$store.source.src.toString()
    // update tracker
    const videoTracker = new MA.MediaTracker("EthernaPlayer", MA.mediaType.VIDEO, resource)
    setTracker(videoTracker)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaEl])

  useEffect(() => {
    if (!tracker) return

    startTracking()

    return () => {
      stopTracking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracker])

  const onPlay = useCallback(() => {
    /**
     * if the player supports something like playlists you might want to check
     * whether the source has changed and if so, call the following 3 methods:
     * tracker.reset()
     * tracker.setResource(newResource)
     * tracker.setMediaTitle(newMediaTitleOrEmptyString)
     */
    // notify the tracker the media is now playing
    tracker?.play()
  }, [tracker])

  const onPause = useCallback(
    (e: Event) => {
      const event = e as CustomEvent<boolean>
      // notify the tracker the media is now paused
      event.detail && tracker?.pause()
    },
    [tracker]
  )

  const onEnded = useCallback(() => {
    // notify the tracker the media is now finished
    tracker?.finish()
  }, [tracker])

  const onTimeUpdate = useCallback(() => {
    // notify the tracker the media is still playing

    // we update the current made progress (time position) and duration of
    // the media. Not all players might give you that information
    tracker?.setMediaProgressInSeconds(mediaEl!.currentTime)
    tracker?.setMediaTotalLengthInSeconds(mediaEl!.$store.duration)

    /**
     * it is important to call the tracker?.update() method regularly while the
     * media is playing. If this method is not called eg every X seconds no
     * updated data will be tracked.
     * The method itself will not actually send a tracking request whenever it
     * is called. Instead it will make sure to respect the set ping interval and
     * eg only send a tracking request every 5 seconds.
     */
    tracker?.update()
  }, [tracker, mediaEl])

  const onSeeking = useCallback(() => {
    // "seekStart" is needed when the player is seeking or buffering.
    // It will stop the timer that tracks for how long the media has been played.
    tracker?.seekStart()
  }, [tracker])

  const onSeeked = useCallback(() => {
    // we update the current made progress (time position) and duration of
    // the media. Not all players might give you that information
    tracker?.setMediaProgressInSeconds(mediaEl!.currentTime)
    tracker?.setMediaTotalLengthInSeconds(mediaEl!.$store.duration)

    // "seekFinish" is needed when the player has finished seeking or buffering.
    // It will start the timer again that tracks for how long the media has been played.
    tracker?.seekFinish()
  }, [tracker, mediaEl])

  const onResize = useCallback(() => {
    tracker?.setWidth(mediaEl!.clientWidth)
    tracker?.setHeight(mediaEl!.clientHeight)
    tracker?.setFullscreen(mediaEl!.$store.fullscreen)
  }, [tracker, mediaEl])

  const startTracking = useCallback(() => {
    if (!tracker) return
    if (!mediaEl) return

    const MA = window.Matomo!.MediaAnalytics

    tracker.setWidth(mediaEl.clientWidth)
    tracker.setHeight(mediaEl.clientHeight)
    tracker.setFullscreen(mediaEl!.$store.fullscreen)

    // the method `getMediaTitle` will try to get a media title from a
    // "data-matomo-title", "title" or "alt" HTML attribute. Sometimes it might be possible
    // to retrieve the media title directly from the video or audio player
    const title = MA.element.getMediaTitle(mediaEl)
    tracker.setMediaTitle(title)

    // some media players let you already detect the total length of the video
    tracker.setMediaTotalLengthInSeconds(mediaEl.$store.duration)

    // add event listeners
    mediaEl.addEventListener("play", onPlay, true)
    mediaEl.addEventListener("pause", onPause, true)
    mediaEl.addEventListener("ended", onEnded, true)
    mediaEl.addEventListener("time-update", onTimeUpdate, true)
    mediaEl.addEventListener("seeking", onSeeking, true)
    mediaEl.addEventListener("seeked", onSeeked, true)
    resizeObserver.current = new ResizeObserver(onResize)
    resizeObserver.current.observe(document.documentElement)

    // here we make sure to send an initial tracking request for this media.
    // This basically tracks an impression for this media.
    tracker.trackUpdate()
  }, [onEnded, onPause, onPlay, onResize, onSeeked, onSeeking, onTimeUpdate, tracker, mediaEl])

  const stopTracking = useCallback(() => {
    mediaEl?.removeEventListener("play", onPlay, true)
    mediaEl?.removeEventListener("pause", onPause, true)
    mediaEl?.removeEventListener("ended", onEnded, true)
    mediaEl?.removeEventListener("time-update", onTimeUpdate, true)
    mediaEl?.removeEventListener("seeking", onSeeking, true)
    mediaEl?.removeEventListener("seeked", onSeeked, true)
  }, [onEnded, onPause, onPlay, onSeeked, onSeeking, onTimeUpdate, mediaEl])
}
