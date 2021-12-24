import fs from "fs"
import path from "path"
import prompt from "prompt"
import chalk from "chalk"
import axios from "axios"
import DotEnv from "dotenv"
import { fileURLToPath } from "url"

DotEnv.config({
  path: fs.existsSync(path.resolve(".env.development"))
    ? ".env.development"
    : ".env"
})

export async function createPostageBatch(amount = 10000000, depth = 20) {
  console.log(chalk.blueBright(`Creating a postage batch with ${amount} BZZ / ${depth} depth...`))
  try {
    const batchResp = await axios.post(`${process.env.BEE_DEBUG_ENDPOINT}/stamps/${amount}/${depth}`)
    const { batchID } = batchResp.data
    console.log(chalk.green(`Created postage batch. Id: ${batchID}`))
    return batchID
  } catch (error) {
    console.log(chalk.red(`Cannot create postage batch: ${error.message}`))
    console.log(error.request.data)
  }
}

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

    const amount = result.bzz || "10000000"
    const depth = result.depth || "20"

    await createPostageBatch(amount, depth)
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fund()
}
