const prefetchers = [
  require("./prefetchers/profilePrefetcher").default,
  require("./prefetchers/videoPrefetcher").default,
]

const prefetch = async renderCallback => {
  window.prefetchData = null

  for (let prefetcher of prefetchers) {
    if (prefetcher.match.test(window.location.pathname)) {
      await prefetcher.fetch()
      break
    }
  }

  renderCallback()
}

export default prefetch
