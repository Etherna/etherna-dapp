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

type Matomo = {
  initialized: boolean
  MediaAnalytics: MediaAnalytics
  addPlugin(at, au): void
  addTracker(av, au): void
  getAsyncTracker(ax, aw): void
  getAsyncTrackers(): void
  getTracker(au, at): void
  off(av, au): void
  on(au, at): void
  retryMissedPluginCalls(): void
  trigger(av, aw, au): void
}

type MediaAnalytics = {
  MediaTracker: {
    new (playerName: string, mediaType: string, source: string): MediaAnalyticsTracker
  }
  mediaType: { AUDIO: "Audio"; VIDEO: "Video" }
  element: {
    getAttribute(node: HTMLMediaElement, attribute: string): string
    getMediaResource(node: HTMLMediaElement, actualSrc: string): string
    getMediaTitle(node: HTMLMediaElement): string
    hasCssClass(node: HTMLMediaElement, className: string): boolean
    isFullscreen(node: HTMLMediaElement): boolean
    isMediaIgnored(node: HTMLMediaElement): boolean
    setAttribute(node: HTMLMediaElement, attribute: string, value: string): void
  }
}

type MediaAnalyticsTracker = {
  setWidth(width: number): void
  setHeight(height: number): void
  setFullscreen(isFullScreen: boolean): void
  setMediaTitle(title: string): void
  setResource(src: string): void
  setMediaTotalLengthInSeconds(duration: number): void
  setMediaProgressInSeconds(currentTime: number): void
  trackUpdate(): void
  play(): void
  pause(): void
  finish(): void
  seekStart(): void
  seekFinish(): void
  update(): void
  reset(): void
}
