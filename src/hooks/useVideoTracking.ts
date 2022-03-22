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

import { useEffect, useRef, useState } from "react"

export default function useVideoTracking(videoElement: HTMLVideoElement | undefined) {
  const [tracker, setTracker] = useState<MediaAnalyticsTracker>()
  const resizeObserver = useRef<ResizeObserver>()

  useEffect(() => {
    if (!videoElement) return
    if (!window.Matomo?.MediaAnalytics) return
    if (!!tracker) return

    const MA = window.Matomo!.MediaAnalytics
    // find the actual resource / URL of the video
    const actualResource = MA.element.getAttribute(videoElement, "src")
    // a user can overwrite the actual resource by defining a "data-matomo-resource" attribute. 
    // the method `getMediaResource` will detect whether such an attribute was set 
    const resource = MA.element.getMediaResource(videoElement, actualResource)
    // update tracker
    const videoTracker = new MA.MediaTracker("EthernaPlayer", MA.mediaType.VIDEO, resource)
    setTracker(videoTracker)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoElement])

  useEffect(() => {
    if (!tracker) return

    startTracking()

    return () => {
      stopTracking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracker])

  const startTracking = () => {
    if (!tracker) return
    if (!videoElement) return

    const MA = window.Matomo!.MediaAnalytics

    tracker.setWidth(videoElement.clientWidth)
    tracker.setHeight(videoElement.clientHeight)
    tracker.setFullscreen(MA.element.isFullscreen(videoElement))

    // the method `getMediaTitle` will try to get a media title from a
    // "data-matomo-title", "title" or "alt" HTML attribute. Sometimes it might be possible
    // to retrieve the media title directly from the video or audio player
    const title = MA.element.getMediaTitle(videoElement)
    tracker.setMediaTitle(title)

    // some media players let you already detect the total length of the video 
    tracker.setMediaTotalLengthInSeconds(videoElement.duration)

    // add event listeners
    videoElement.addEventListener("play", onPlay, true)
    videoElement.addEventListener("pause", onPause, true)
    videoElement.addEventListener("ended", onEnded, true)
    videoElement.addEventListener("timeupdate", onTimeUpdate, true)
    videoElement.addEventListener("seeking", onSeeking, true)
    videoElement.addEventListener("seeked", onSeeked, true)
    resizeObserver.current = new ResizeObserver(onResize)
    resizeObserver.current.observe(document.documentElement)

    // here we make sure to send an initial tracking request for this media. 
    // This basically tracks an impression for this media. 
    tracker.trackUpdate()
  }

  const stopTracking = () => {
    videoElement?.removeEventListener("play", onPlay, true)
    videoElement?.removeEventListener("pause", onPause, true)
    videoElement?.removeEventListener("ended", onEnded, true)
    videoElement?.removeEventListener("timeupdate", onTimeUpdate, true)
    videoElement?.removeEventListener("seeking", onSeeking, true)
    videoElement?.removeEventListener("seeked", onSeeked, true)
  }

  const onPlay = () => {
    /**
     * if the player supports something like playlists you might want to check 
     * whether the source has changed and if so, call the following 3 methods:
     * tracker.reset()
     * tracker.setResource(newResource)
     * tracker.setMediaTitle(newMediaTitleOrEmptyString)
     */
    // notify the tracker the media is now playing
    tracker?.play()
  }

  const onPause = () => {
    // notify the tracker the media is now paused
    tracker?.pause()
  }

  const onEnded = () => {
    // notify the tracker the media is now finished
    tracker?.finish()
  }

  const onTimeUpdate = () => {
    // notify the tracker the media is still playing

    // we update the current made progress (time position) and duration of 
    // the media. Not all players might give you that information
    tracker?.setMediaProgressInSeconds(videoElement!.currentTime)
    tracker?.setMediaTotalLengthInSeconds(videoElement!.duration)

    /**
     * it is important to call the tracker?.update() method regularly while the 
     * media is playing. If this method is not called eg every X seconds no 
     * updated data will be tracked. 
     * The method itself will not actually send a tracking request whenever it 
     * is called. Instead it will make sure to respect the set ping interval and
     * eg only send a tracking request every 5 seconds.
     */
    tracker?.update()
  }

  const onSeeking = () => {
    // "seekStart" is needed when the player is seeking or buffering. 
    // It will stop the timer that tracks for how long the media has been played.
    tracker?.seekStart()
  }

  const onSeeked = () => {
    // we update the current made progress (time position) and duration of 
    // the media. Not all players might give you that information
    tracker?.setMediaProgressInSeconds(videoElement!.currentTime)
    tracker?.setMediaTotalLengthInSeconds(videoElement!.duration)

    // "seekFinish" is needed when the player has finished seeking or buffering. 
    // It will start the timer again that tracks for how long the media has been played.
    tracker?.seekFinish()
  }

  const onResize = () => {
    const MA = window.Matomo!.MediaAnalytics
    tracker?.setWidth(videoElement!.clientWidth)
    tracker?.setHeight(videoElement!.clientHeight)
    tracker?.setFullscreen(MA.element.isFullscreen(videoElement!))
  }
}
