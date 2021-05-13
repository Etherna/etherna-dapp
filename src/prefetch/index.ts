import profilePrefetcher from "./prefetchers/profilePrefetcher"
import videoPrefetcher from "./prefetchers/videoPrefetcher"

const prefetchers = [
  profilePrefetcher,
  videoPrefetcher,
]

const prefetch = async (renderCallback: () => void) => {
  window.prefetchData = undefined

  for (const prefetcher of prefetchers) {
    if (prefetcher.match.test(window.location.pathname)) {
      await prefetcher.fetch()
      break
    }
  }

  renderCallback()
}

export default prefetch
