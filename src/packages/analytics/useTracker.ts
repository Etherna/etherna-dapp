import { useCallback, useContext, useEffect, useState } from "react"

import { AnalyticsContext } from "./context"

import type {
  TrackEventParams,
  TrackLinkParams,
  TrackPageViewParams,
  TrackSiteSearchParams,
} from "./types"

export function useAnalytics() {
  const instance = useContext(AnalyticsContext)
  const [linkTracking, setLinkTracking] = useState(false)

  useEffect(() => {
    const handleOutboundClick = (event: MouseEvent) => {
      // The target is not guaranteed to be a link, it could be a child element.
      // Look up the element's parent until the anchor element is found.
      const findLinkElement = (el: EventTarget | null): HTMLElement | null => {
        if (el instanceof HTMLAnchorElement && el.href) {
          return el
        }
        if (el instanceof HTMLElement && el.parentElement) {
          return findLinkElement(el.parentElement)
        }
        return null
      }

      const target = findLinkElement(event.target)

      if (!(target instanceof HTMLAnchorElement)) {
        return
      }

      const { href } = target

      // Check if the click target differs from the current hostname, meaning it's external
      if (
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        !href.match(
          new RegExp(`^(http://www.|https://www.|http://|https://)+(${window.location.hostname})`)
        )
      ) {
        instance!.trackLink({ href })
      }
    }

    if (instance && linkTracking) {
      document.addEventListener("click", handleOutboundClick, {
        capture: true,
      })
    }

    return () => {
      document.removeEventListener("click", handleOutboundClick, {
        capture: true,
      })
    }
  }, [instance, linkTracking])

  const trackPageView = useCallback(
    (params?: TrackPageViewParams) => instance?.trackPageView(params),
    [instance]
  )

  const trackEvent = useCallback(
    (params: TrackEventParams) => instance?.trackEvent(params),
    [instance]
  )

  const trackEvents = useCallback(() => instance?.trackEvents(), [instance])

  const trackSiteSearch = useCallback(
    (params: TrackSiteSearchParams) => instance?.trackSiteSearch(params),
    [instance]
  )

  const trackLink = useCallback(
    (params: TrackLinkParams) => instance?.trackLink(params),
    [instance]
  )

  const enableLinkTracking = useCallback(() => {
    setLinkTracking(true)
  }, [])

  const pushInstruction = useCallback(
    (name: string, ...args: any[]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      instance?.pushInstruction(name, ...args)
    },
    [instance]
  )

  return {
    trackEvent,
    trackEvents,
    trackPageView,
    trackSiteSearch,
    trackLink,
    enableLinkTracking,
    pushInstruction,
  }
}
