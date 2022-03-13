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
    new(playerName: string, mediaType: string, source: string): MediaAnalyticsTracker
  }
  mediaType: { AUDIO: "Audio", VIDEO: "Video" }
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
