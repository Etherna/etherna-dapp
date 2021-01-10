import { WindowPrefetchData } from "typings/window"

const prefetchers = [
  require("./prefetchers/profilePrefetcher").default,
  require("./prefetchers/videoPrefetcher").default,
]

const prefetch = async (renderCallback: () => void) => {
  const windowPrefetch = window as WindowPrefetchData
  windowPrefetch.prefetchData = undefined

  for (const prefetcher of prefetchers) {
    if (prefetcher.match.test(window.location.pathname)) {
      await prefetcher.fetch()
      break
    }
  }

  renderCallback()
}

export default prefetch
