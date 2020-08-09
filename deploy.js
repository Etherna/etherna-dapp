const deploy = async () => {
  const args = process.argv
  const isSwarm = args.length > 2 && args[2] === "--swarm"
  const isFeed = args.length > 2 && args[2] === "--feed"

  if (isSwarm) {
    const { deployToSwarm } = require("./deploy.swarm")
    const { updateFeed } = require("./deploy.feed")

    const hash = await deployToSwarm()
    await updateFeed(hash)
  } else if (isFeed) {
    const { updateFeed } = require("./deploy.feed")

    const hash = args.length > 3 && args[3]
    await updateFeed(hash)
  } else {
    const { deployToHost } = require("./deploy.hosting")

    deployToHost()
  }
}

deploy()
