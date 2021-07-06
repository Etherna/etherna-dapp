import fs from "fs"
import path from "path"
import prompt from "prompt"
import chalk from "chalk"
import { ethers } from "ethers"
import BeeJs from "@ethersphere/bee-js"
import DotEnv from "dotenv"

DotEnv.config({
  path: fs.existsSync(path.resolve(".env.development"))
    ? ".env.development"
    : ".env"
})

const bee = new BeeJs.Bee(process.env.BEE_ENDPOINT)
const provider = new ethers.providers.JsonRpcProvider(process.env.BEE_SWAP_ENDPOINT)
const erc20PartialABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  }
]

const fund = () => {
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
      const batchId = await bee.createPostageBatch(result.bzz, +result.depth)
      console.log(chalk.green(`Created postage batch. Id: ${batchId}`))
    } catch (error) {
      console.log(chalk.red(`Cannot create batch: ${error.message}`))
      console.log(error.request)
    }
  })
}

const checkAddressAndFund = async () => {
  const address = process.env.BEE_ADDRESS
  const testnetTokenAddress = "0x2ac3c1d3e24b45c6c310534bc2dd84b5ed576335"

  const ethBalance = await provider.getBalance(address)

  if (ethBalance.isZero()) {
    return console.log(chalk.red("You need some ETH to create a transaction"))
  }

  const contract = new ethers.Contract(testnetTokenAddress, erc20PartialABI, provider)
  const bzzBalance = +ethers.utils.formatUnits(await contract.balanceOf(address), "wei")

  if (bzzBalance === 0) {
    return console.log(chalk.red("You need some BZZ to create a postage batch"))
  } else {
    console.log(chalk.green(`You have ${bzzBalance} BZZ`))
    console.log(`Suggested for batch creation: 10000000 BZZ / 20 depth`)
  }

  fund(bzzBalance)
}

checkAddressAndFund()
