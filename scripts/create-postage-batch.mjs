import { fileURLToPath } from "url"
import axios from "axios"
import chalk from "chalk"
import prompt from "prompt"

export async function createPostageBatch(amount = 10000000, depth = 20) {
  console.log(chalk.blueBright(`Authenticating...`))

  const token = await authToken()

  console.log(chalk.blueBright(`Creating a postage batch with ${amount} BZZ / ${depth} depth...`))

  try {
    const batchResp = await axios.post(
      `${process.env.BEE_ENDPOINT}/stamps/${amount}/${depth}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const { batchID } = batchResp.data
    console.log(chalk.blueBright(`Created postage batch: ${batchID}`))
    return batchID
  } catch (error) {
    console.log(chalk.red(`Cannot create postage batch: ${error.message}`))
    console.log(error.request.data)
  }
}

async function authToken() {
  const username = ""
  const password = process.env.BEE_ADMIN_PASSWORD
  const credentials = Buffer.from(`${username}:${password}`).toString("base64")

  const data = {
    role: "maintainer",
    expiry: 3600 * 24,
  }

  try {
    const resp = await axios.post(`${process.env.BEE_ENDPOINT}/auth`, data, {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    })
    return resp.data.key
  } catch (error) {
    console.log(error.response?.data ?? error)
  }
}

const fund = () => {
  console.log(`Suggested for batch creation: 10000000 BZZ / 20 depth`)

  const properties = [
    {
      name: "bzz",
    },
    {
      name: "depth",
    },
  ]

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
