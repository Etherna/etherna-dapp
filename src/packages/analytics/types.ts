import type { MatomoTracker } from "./tracker"

export interface MatomoInstance {
  trackEvent: MatomoTracker["trackEvent"]
  trackEvents: MatomoTracker["trackEvents"]
  trackPageView: MatomoTracker["trackPageView"]
  trackSiteSearch: MatomoTracker["trackSiteSearch"]
  trackLink: MatomoTracker["trackLink"]
  pushInstruction: MatomoTracker["pushInstruction"]
}

export interface Matomo {
  initialized: boolean
  MediaAnalytics: MediaAnalytics
  addPlugin(at: any, au: any): void
  addTracker(av: any, au: any): void
  getAsyncTracker(ax: any, aw: any): void
  getAsyncTrackers(): void
  getTracker(au: any, at: any): void
  off(av: any, au: any): void
  on(au: any, at: any): void
  retryMissedPluginCalls(): void
  trigger(av: any, aw: any, au: any): void
}

export interface MediaAnalytics {
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

export interface MediaAnalyticsTracker {
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

export interface CustomDimension {
  id: number
  value: string
}

export interface UserOptions {
  urlBase: string
  siteId: number
  userId?: string
  trackerUrl?: string
  srcUrl?: string
  disabled?: boolean
  heartBeat?: {
    active: boolean
    seconds?: number
  }
  linkTracking?: boolean
  configurations?: {
    [key: string]: any
  }
}

export interface TrackPageViewParams {
  documentTitle?: string
  href?: string | Location
  customDimensions?: boolean | CustomDimension[]
}

export interface TrackParams extends TrackPageViewParams {
  data: any[]
}

export interface TrackEventParams extends TrackPageViewParams {
  category: string
  action: string
  name?: string
  value?: number
}

export interface TrackLinkParams {
  href: string
  linkType?: "download" | "link"
}

export interface TrackSiteSearchParams extends TrackPageViewParams {
  keyword: string
  category?: string
  count?: number
}

export interface TrackEcommerceOrderParams {
  orderId: string
  orderRevenue: number
  orderSubTotal?: number
  taxAmount?: number
  shippingAmount?: number
  discountOffered?: boolean
}

export interface AddEcommerceItemParams {
  sku: string
  productName?: string
  productCategory?: string
  productPrice?: number
  productQuantity?: number
}

export interface RemoveEcommerceItemParams {
  sku: string
}

export interface SetEcommerceViewParams {
  sku: string | boolean
  productName?: string | boolean
  productCategory?: string
  productPrice?: number
}
