import fs from "fs"
import path from "path"
import prompt from "prompt"
import chalk from "chalk"
import BeeJs from "@ethersphere/bee-js"
import DotEnv from "dotenv"

DotEnv.config({
  path: fs.existsSync(path.resolve(".env.development"))
    ? ".env.development"
    : ".env"
})

const bee = new BeeJs.Bee(process.env.BEE_ENDPOINT)

const fund = () => {
  console.log(`Suggested for batch creation: 10000000 BZZ / 20 depth`)

  const properties = [{
    name: "bzz",
  }, {
    name: "depth",
  }]

  prompt.start()

  prompt.get(properties, async function (err, result) {
    if (err) {
      console.log(chalk.red(`Input error: ${err}`))
      return 1
    }

    console.log(`Creating a postage batch with ${result.bzz} BZZ / ${result.depth} depth...`)

    try {
      const batchId = await bee.createPostageBatch(result.bzz || "10000000", +(result.depth || "20"))
      console.log(chalk.green(`Created postage batch. Id: ${batchId}`))
    } catch (error) {
      console.log(chalk.red(`Cannot create batch: ${error.message}`))
      console.log(error.request)
    }
  })
}

fund()
